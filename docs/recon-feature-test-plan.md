# Recon Feature Test Plan

## Overview
This document outlines the testing strategy for the reworked Recon feature which implements a two-step flow: Application List View and Application Detail View.

## Test Scope

### 1. Application List View (First Screen)

#### Functional Tests
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-AL-01 | Load application list | List of applications displays with name, status badge, and record count |
| TC-AL-02 | Search by application name | Only matching applications appear in the list |
| TC-AL-03 | Filter by application status | Only applications with selected status appear |
| TC-AL-04 | Pagination navigation | Navigate between pages correctly |
| TC-AL-05 | Page size change | Adjust items per page and reset to page 1 |
| TC-AL-06 | Select application | Navigates to Application Detail View |
| TC-AL-07 | Empty state | Shows "No Applications Found" message when no results |
| TC-AL-08 | Loading state | Shows loading indicator while fetching data |

#### Edge Cases
- Application name with special characters (/, &, parentheses)
- Very long application names
- Empty/null application status
- Single application in list

### 2. Application Detail View (Second Screen)

#### Functional Tests
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-AD-01 | Load application detail | Shows header with app name, status, and grouped table |
| TC-AD-02 | Back navigation | Returns to Application List View |
| TC-AD-03 | Search across all fields | Filters records by search query |
| TC-AD-04 | Column sorting | Sorts by clicked column, toggles direction |
| TC-AD-05 | Column filtering | Excel-style filter popover works |
| TC-AD-06 | Expand/collapse groups | Toggle account groups visibility |
| TC-AD-07 | Pagination | Navigate between account group pages |
| TC-AD-08 | Row click | Opens details dialog with record info |
| TC-AD-09 | Export to Excel | Downloads Excel file with filtered data |
| TC-AD-10 | Empty state | Shows "No Records Found" when no results |

#### Edge Cases
- Application with single account group
- Account name with null value (shows "(No Account)")
- Very large number of records
- Special characters in search query

### 3. API Endpoints

#### GET /api/recon/applications
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-API-01 | Get all applications | Returns paginated application list |
| TC-API-02 | Search parameter | Filters by application name |
| TC-API-03 | Status filter | Filters by application status |
| TC-API-04 | Invalid page number | Returns page 1 |
| TC-API-05 | Limit capping | Caps limit at 100 |

#### GET /api/recon/applications/:applicationName
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-API-06 | Get application detail | Returns grouped records by account |
| TC-API-07 | URL encoded name | Handles special characters correctly |
| TC-API-08 | Search parameter | Filters records |
| TC-API-09 | Sort parameters | Sorts by specified column |
| TC-API-10 | Filter parameters | Applies column filters |

#### GET /api/recon/applications/:applicationName/filter-options
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-API-11 | Get filter options | Returns unique values for filterable columns |
| TC-API-12 | Empty application | Returns empty object |

## Unit Tests

### Service Layer Tests
Located in: `server/features/recon/recon.applications.test.ts`

- getApplicationList tests
- getApplicationDetail tests
- getApplicationFilterOptions tests
- Input sanitization tests
- Pagination calculation tests

### Run Tests
```bash
npm run test
```

## Manual Testing Checklist

### Pre-requisites
- [ ] Database contains test data with multiple applications
- [ ] Application is running without errors

### Application List View
- [ ] Page loads without errors
- [ ] Applications are sorted alphabetically
- [ ] Search box filters as you type (debounced)
- [ ] Status dropdown shows all available statuses
- [ ] Clicking an application card navigates to detail view
- [ ] Pagination controls work correctly
- [ ] Export button exports current view

### Application Detail View
- [ ] Header shows correct application name and status
- [ ] Back button returns to list view
- [ ] Table shows records grouped by Account Name
- [ ] Groups are collapsible
- [ ] Search filters across all visible data
- [ ] Sort icons appear on column click
- [ ] Filter popovers show unique values
- [ ] Clicking a row opens details dialog
- [ ] Dialog shows all record fields
- [ ] Export exports current filtered data

## Performance Considerations

- Application list should load within 2 seconds
- Detail view should load within 3 seconds for up to 1000 records
- Search debouncing prevents excessive API calls
- Pagination prevents loading too many records at once

## Browser Compatibility

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
