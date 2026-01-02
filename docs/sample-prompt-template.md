# Sample Prompt Template for Multi-Step Feature Requirements

## Overview
This document provides a template for writing effective prompts when requesting complex, multi-step feature implementations. A well-structured prompt helps ensure complete and accurate implementation.

## Template Structure

### 1. High-Level Goal Statement
Start with a clear, concise statement of what you want to achieve.

**Example:**
> "I want to rework the Recon feature"

### 2. Flow Description
Describe the user journey through your feature, step by step.

**Example:**
> "It would be like a two step process now where:"

### 3. Detailed View Specifications
For each view/screen, specify:
- What the user sees
- What actions the user can take
- How data is organized/displayed
- Navigation between views

**Example:**
```
1st view:
- The user can see the list of applications available.
- The user can search for an application in a search bar
- The user can select the applicationstatus by using a dropdown
- The user can navigate through pages in this application list.

After the selection of an application, it would take the user to the 2nd view.

2nd view:
- The user will be able to see a header what application he selected.
- The user will be able to see a table that is grouped by Account Name
- The user will be able to search across all fields of this table.
- The user can also filter this table like an excel
- The user can also sort the table
- When the user clicks a specific row. The user would be shown a popup that displays that specific row details.
```

### 4. Additional Requirements
Specify any extra requirements:
- Testing requirements
- UI/UX consistency needs
- Documentation needs
- Performance requirements

**Example:**
```
Create thorough testing scripts and plans for testing this feature.

Make sure the UI/UX of this is consistent with the other pages of this application
```

## Complete Prompt Example

```
I want to rework the [Feature Name]

It would be like a [N]-step process now where:

1st view:
- [List what the user sees]
- [List what actions are available]
- [Describe data organization]
- [Describe navigation]

After [trigger action], it would take the user to the 2nd view.

2nd view:
- [List what the user sees - include header/context info]
- [Describe data display - table, cards, grouped by X]
- [List filtering capabilities]
- [List sorting capabilities]
- [Describe row/item click behavior]

Additional requirements:
- [Testing requirements]
- [UI/UX requirements]
- [Performance requirements]
- [Documentation needs]
```

## Best Practices

### DO:
1. **Be specific about data grouping** - "grouped by Account Name" is clearer than "grouped"
2. **Describe user actions explicitly** - "click a row" tells us what triggers the action
3. **Mention filtering/sorting needs** - "filter like an excel" indicates multi-select column filters
4. **Include navigation flows** - "takes the user to the 2nd view" shows the connection between screens
5. **Specify UI consistency** - "consistent with other pages" ensures the implementation matches existing patterns

### DON'T:
1. Assume technical knowledge - be explicit about desired behavior
2. Leave out interaction details - specify clicks, hovers, selections
3. Forget edge cases - mention what happens with no data, errors, etc.
4. Skip testing requirements - explicitly request tests if needed

## Checklist for Your Prompt

- [ ] Clear high-level goal
- [ ] Each view/screen described separately
- [ ] User actions specified for each view
- [ ] Data display format described (table, cards, list)
- [ ] Grouping requirements mentioned
- [ ] Search/filter/sort capabilities specified
- [ ] Navigation between views explained
- [ ] Click/selection behaviors described
- [ ] Popup/dialog requirements included
- [ ] Testing requirements stated
- [ ] UI consistency requirements stated
