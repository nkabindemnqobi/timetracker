export const ISSUE_TYPE_MAPPING = {
  'Story': 'dev',
  'Task': 'dev',
  'Sub-task': 'dev',
  'Epic': 'dev',
  'Bug': 'bug',
  'Analysis': 'ana',
  'Research': 'ana',
  'Investigation': 'ana',
  'Spike': 'ana',
  'Technical Debt': 'dev',
  'Improvement': 'dev',
  'New Feature': 'dev',
  'Enhancement': 'dev'
}

export const getIssueTypeCode = (issueTypeName) => {
  const normalizedType = issueTypeName?.trim() || ''
  return ISSUE_TYPE_MAPPING[normalizedType] || 'dev'
}
