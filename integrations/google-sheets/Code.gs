/**
 * Bound Google Apps Script for the SKS Sustainability Data Workbook.
 *
 * Deploy as a web app that executes as the workbook owner. This endpoint never
 * exposes a raw sheet. It builds one of two strict, versioned public snapshots:
 *   ?dataset=site-content
 *   ?dataset=projects
 */

const PUBLICATION_STATUS = 'published';
const REVIEW_STATUS = 'reviewed';

function doGet(event) {
  try {
    const dataset = String((event && event.parameter && event.parameter.dataset) || 'site-content').trim();
    if (dataset === 'site-content') return json_(buildSiteContentSnapshot_());
    if (dataset === 'projects') return json_(buildProjectSnapshot_());
    return json_({ error: { code: 'INVALID_DATASET', message: 'dataset must be site-content or projects.' } });
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    return json_({
      error: {
        code: 'SNAPSHOT_NOT_READY',
        message: 'The reviewed public snapshot is not ready. No draft or private rows were returned.',
      },
    });
  }
}

function buildSiteContentSnapshot_() {
  const overview = publishedFieldMap_('Overview');
  requireFields_(overview, [
    'sustainability_definition',
    'place_context',
    'value_truth',
    'value_respect',
    'value_responsibility',
    'value_scholarship',
  ], 'Overview');

  const start = publishedFieldMap_('START');
  requireFields_(start, [
    'introduction',
    'adoption_status',
    'workflow_1',
    'workflow_2',
    'workflow_3',
    'workflow_4',
    'workflow_5',
    'privacy_boundary',
    'approved_by',
    'approved_at',
  ], 'START');

  const adoptionStatus = textValue_(start, 'adoption_status');
  if (adoptionStatus !== 'working-purpose' && adoptionStatus !== 'confirmed') {
    throw new Error('START adoption_status must be working-purpose or confirmed.');
  }
  if (adoptionStatus === 'confirmed') {
    requireFields_(start, ['official_expansion', 'adoption_rationale', 'owner', 'adoption_date'], 'confirmed START adoption');
  }

  const carbonRows = rowsByField_('Carbon Plan');
  const carbonPublished = new Map(
    Array.from(carbonRows.entries()).filter(function (entry) {
      return String(entry[1].workflow_status || '').trim() === PUBLICATION_STATUS;
    }),
  );
  const carbonPlan = buildCarbonPlan_(carbonPublished);
  const sourceReferences = Array.from(new Set(Array.from(overview.values())
    .map(function (row) { return httpUrlOrNull_(row.public_source_url); })
    .filter(Boolean)));

  return {
    schemaVersion: 1,
    source: {
      id: 'sks-sustainability-google-sheet',
      label: 'Storm King School reviewed sustainability workbook',
      synthetic: false,
      generatedAt: new Date().toISOString(),
      publicationStatus: 'reported',
      quality: carbonPlan.progressPercent === null ? 'pending' : carbonPlan.quality,
      methodologyNote: 'Only rows marked published are mapped into this strict public contract. Blank values remain null and private workbook columns are not exported.',
    },
    overview: {
      sustainabilityDefinition: textValue_(overview, 'sustainability_definition'),
      placeContext: textValue_(overview, 'place_context'),
      valueAlignment: [
        { value: 'Truth', statement: textValue_(overview, 'value_truth') },
        { value: 'Respect', statement: textValue_(overview, 'value_respect') },
        { value: 'Responsibility', statement: textValue_(overview, 'value_responsibility') },
        { value: 'Scholarship', statement: textValue_(overview, 'value_scholarship') },
      ],
      sourceReferences: sourceReferences,
    },
    start: {
      introduction: textValue_(start, 'introduction'),
      adoptionRationale: nullableTextValue_(start, 'adoption_rationale'),
      adoptionStatus: adoptionStatus,
      owner: nullableTextValue_(start, 'owner'),
      adoptionDate: nullableDateValue_(start, 'adoption_date'),
      workflow: [1, 2, 3, 4, 5].map(function (index) { return textValue_(start, 'workflow_' + index); }),
      privacyBoundary: textValue_(start, 'privacy_boundary'),
      snapshotCadence: nullableTextValue_(start, 'snapshot_cadence'),
    },
    carbonPlan: carbonPlan,
  };
}

function buildCarbonPlan_(published) {
  const goal = nullableTextValue_(published, 'goal');
  const targetYear = nullableNumberValue_(published, 'target_year');
  const baselineYear = nullableNumberValue_(published, 'baseline_year');
  const latestYear = nullableNumberValue_(published, 'latest_reporting_year');
  const boundary = nullableTextValue_(published, 'inventory_boundary');
  const baselineGross = nullableNumberValue_(published, 'baseline_gross_emissions');
  const latestGross = nullableNumberValue_(published, 'latest_gross_emissions');
  const targetGross = nullableNumberValue_(published, 'target_gross_emissions');
  const updatedAt = nullableDateValue_(published, 'updated_at');
  const quality = nullableTextValue_(published, 'quality') || 'pending';

  const progressInputs = [goal, targetYear, baselineYear, latestYear, boundary, baselineGross, latestGross, targetGross, updatedAt];
  let progressPercent = null;
  if (progressInputs.every(function (value) { return value !== null; })) {
    if (baselineGross <= targetGross) throw new Error('Baseline gross emissions must exceed target gross emissions.');
    progressPercent = 100 * (baselineGross - latestGross) / (baselineGross - targetGross);
  }

  const retiredCredits = nullableNumberValue_(published, 'retired_credits');
  const creditsMethod = nullableTextValue_(published, 'credits_method');
  const creditsEvidenceUrl = httpUrlOrNull_(nullableTextValue_(published, 'credits_public_evidence_url'));
  if (retiredCredits !== null && (!creditsMethod || !creditsEvidenceUrl || !updatedAt)) {
    throw new Error('Retired credits require a method, public registry evidence, and update date.');
  }

  return {
    definition: 'A credible carbon-neutrality plan defines the emissions boundary, measures a baseline, prioritizes direct reductions, reports residual emissions separately, and documents any retired credits or removals with evidence.',
    goal: goal,
    targetYear: integerOrNull_(targetYear),
    baselineYear: integerOrNull_(baselineYear),
    latestReportingYear: integerOrNull_(latestYear),
    inventoryBoundary: boundary,
    baselineGrossEmissionsTco2e: baselineGross,
    latestGrossEmissionsTco2e: latestGross,
    targetGrossEmissionsTco2e: targetGross,
    progressPercent: progressPercent,
    progressMetric: progressPercent === null ? null : 'Progress toward the approved gross-emissions reduction target.',
    progressMethod: progressPercent === null ? null : '100 × (baseline gross − latest gross) ÷ (baseline gross − target gross). Credits and project outcomes are excluded.',
    retiredOffsetsTco2e: retiredCredits,
    offsetsMethod: retiredCredits === null ? null : creditsMethod,
    offsetsEvidenceReference: retiredCredits === null ? null : creditsEvidenceUrl,
    status: goal === null ? 'Framework' : progressPercent === null ? 'Baseline in progress' : 'Plan active',
    updatedAt: updatedAt,
    quality: quality,
    framework: [
      { id: 'define', title: 'Define', description: 'Approve the organizational boundary, included scopes, reporting year, and terminology.' },
      { id: 'measure', title: 'Measure', description: 'Build a gross emissions inventory from activity data and documented factors.' },
      { id: 'reduce', title: 'Reduce', description: 'Prioritize actions that lower comparable gross emissions.' },
      { id: 'address-residuals', title: 'Address residuals', description: 'Report remaining emissions and any retired credits separately.' },
      { id: 'review', title: 'Review and publish', description: 'Check methods, evidence, corrections, and progress before public release.' },
    ],
  };
}

function buildProjectSnapshot_() {
  const evidence = evidenceMap_();
  const projectRows = tableRows_('Projects').filter(function (row) {
    return String(row.workflow_status || '').trim() === PUBLICATION_STATUS;
  });
  const metricRows = tableRows_('Project Metrics').filter(function (row) {
    return String(row.workflow_status || '').trim() === PUBLICATION_STATUS;
  });

  const publicProjects = projectRows.map(function (project) {
    reviewedEvidence_(evidence, project.evidence_id, 'project ' + project.project_id);
    const metrics = metricRows.filter(function (metric) { return metric.project_id === project.project_id; }).map(function (metric) {
      const evidenceRecord = reviewedEvidence_(evidence, metric.evidence_id, 'metric ' + metric.metric_observation_id);
      const numericValue = nullableNumber_(metric.numeric_value);
      const periodStart = nullableDate_(metric.period_start);
      const periodEnd = nullableDate_(metric.period_end);
      if (numericValue !== null && (!periodStart || !periodEnd)) {
        throw new Error('Published metric ' + metric.metric_observation_id + ' needs period_start and period_end.');
      }
      if (String(metric.include_in_carbon_progress).toLowerCase() === 'true') {
        throw new Error('Project outcomes cannot be included in carbon progress.');
      }
      const evidenceReference = evidenceRecord.access_level === 'public'
        ? httpUrlOrNull_(evidenceRecord.public_source_url)
        : null;
      return {
        id: String(metric.metric_key || '').trim(),
        label: String(metric.display_label || '').trim(),
        metricType: String(metric.metric_type || '').trim(),
        value: numericValue,
        unit: String(metric.unit || '').trim(),
        periodStart: periodStart,
        periodEnd: periodEnd,
        quality: String(metric.quality || 'pending').trim(),
        sourceLabel: String(metric.source_label || '').trim(),
        methodologyNote: nullableText_(metric.methodology_note),
        evidenceReference: evidenceReference,
        equivalencies: [],
      };
    });

    return {
      id: String(project.project_id || '').trim(),
      title: String(project.title || '').trim(),
      category: String(project.category || '').trim(),
      status: String(project.public_status || '').trim(),
      summary: String(project.summary || '').trim(),
      milestone: {
        label: String(project.milestone_label || '').trim(),
        stage: String(project.milestone_stage || '').trim(),
        target: String(project.milestone_target || 'Awaiting reviewed target').trim(),
      },
      impact: null,
      impactQuality: 'pending',
      metrics: metrics,
      verificationReference: null,
      nextPublicStep: nullableText_(project.next_public_step),
      updatedAt: requiredDate_(project.updated_at, 'project ' + project.project_id),
      quality: String(project.quality || 'pending').trim(),
    };
  });

  return {
    schemaVersion: 1,
    source: {
      id: 'sks-projects-google-sheet',
      label: 'Storm King School reviewed sustainability workbook',
      synthetic: false,
      generatedAt: new Date().toISOString(),
      publicationStatus: 'reported',
      quality: publicProjects.length === 0 || publicProjects.some(function (project) {
        return project.quality === 'pending' || project.metrics.some(function (metric) { return metric.quality === 'pending'; });
      }) ? 'pending' : 'measured',
    },
    publicProjects: publicProjects,
  };
}

function tableRows_(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error('Missing required sheet: ' + sheetName);
  const values = sheet.getDataRange().getValues();
  if (values.length < 4) throw new Error('Sheet has no public table: ' + sheetName);
  const headers = values[3].map(function (value) { return String(value || '').trim(); });
  return values.slice(4).filter(function (row) {
    return row.some(function (value) { return value !== '' && value !== null; });
  }).map(function (row) {
    const record = {};
    headers.forEach(function (header, index) {
      if (header) record[header] = normalizeCell_(row[index]);
    });
    return record;
  });
}

function rowsByField_(sheetName) {
  const map = new Map();
  tableRows_(sheetName).forEach(function (row) {
    const key = String(row.field_key || '').trim();
    if (!key) return;
    if (map.has(key)) throw new Error('Duplicate field_key in ' + sheetName + ': ' + key);
    map.set(key, row);
  });
  return map;
}

function publishedFieldMap_(sheetName) {
  const map = rowsByField_(sheetName);
  return new Map(Array.from(map.entries()).filter(function (entry) {
    return String(entry[1].workflow_status || '').trim() === PUBLICATION_STATUS;
  }));
}

function evidenceMap_() {
  const map = new Map();
  tableRows_('Evidence').forEach(function (row) {
    const id = String(row.evidence_id || '').trim();
    if (id) map.set(id, row);
  });
  return map;
}

function reviewedEvidence_(evidence, id, label) {
  const record = evidence.get(String(id || '').trim());
  if (!record || String(record.review_status || '').trim() !== REVIEW_STATUS) {
    throw new Error('Reviewed evidence is required for ' + label + '.');
  }
  return record;
}

function requireFields_(map, keys, label) {
  const missing = keys.filter(function (key) {
    return !map.has(key) || nullableText_(map.get(key).public_value) === null;
  });
  if (missing.length) throw new Error(label + ' is missing published fields: ' + missing.join(', '));
}

function textValue_(map, key) {
  const value = nullableTextValue_(map, key);
  if (value === null) throw new Error('Required published field is blank: ' + key);
  return value;
}

function nullableTextValue_(map, key) {
  return map.has(key) ? nullableText_(map.get(key).public_value !== undefined ? map.get(key).public_value : map.get(key).value) : null;
}

function nullableNumberValue_(map, key) {
  return map.has(key) ? nullableNumber_(map.get(key).value) : null;
}

function nullableDateValue_(map, key) {
  if (!map.has(key)) return null;
  const row = map.get(key);
  return nullableDate_(row.public_value !== undefined ? row.public_value : row.value);
}

function nullableText_(value) {
  if (value === '' || value === null || value === undefined) return null;
  const text = String(value).trim();
  return text ? text : null;
}

function nullableNumber_(value) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error('Published numeric values must be finite and non-negative.');
  return number;
}

function integerOrNull_(value) {
  if (value === null) return null;
  if (!Number.isInteger(value)) throw new Error('Published year values must be integers.');
  return value;
}

function nullableDate_(value) {
  if (value === '' || value === null || value === undefined) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return Utilities.formatDate(value, 'UTC', 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error('Published dates must use YYYY-MM-DD.');
  return text;
}

function requiredDate_(value, label) {
  const date = nullableDate_(value);
  if (!date) throw new Error('A published update date is required for ' + label + '.');
  return date;
}

function httpUrlOrNull_(value) {
  const text = nullableText_(value);
  if (text === null) return null;
  if (!/^https?:\/\//i.test(text)) throw new Error('Public source URLs must use HTTP or HTTPS.');
  return text;
}

function normalizeCell_(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return Utilities.formatDate(value, 'UTC', 'yyyy-MM-dd');
  }
  return value;
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
