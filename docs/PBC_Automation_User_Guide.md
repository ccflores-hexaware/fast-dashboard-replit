# PBC Automation System - User Guide

## Overview

The **PBC Automation System** is a Self-Service Control Evidence System designed to streamline the process of requesting and managing control execution evidence for auditors. This system supports **43 IAM controls** — 9 automated controls and 34 manual controls — enabling efficient evidence collection and tracking.

### Key Benefits
- **Self-service access** to control execution evidence
- **Automated evidence generation** for supported controls
- **Centralized request tracking** with full history visibility
- **Date range validation** ensuring accurate evidence periods
- **Excel export capability** for easy reporting

---

## Screen 1: Control Execution Evidence

This is the primary screen where users request and manage evidence for IAM controls.

### Features

#### Request Evidence Panel
- **Control Selection**: Choose from a dropdown of 43 IAM controls
  - Controls are categorized as **Automated** (9 controls) or **Manual** (34 controls)
  - Automated controls: Evidence is generated directly by the system
  - Manual controls: Redirects to a SharePoint intake form for processing

- **Date Range Selection**: Specify the evidence period
  - **From Date** and **To Date** pickers
  - Built-in validation:
    - Future dates are not allowed
    - Maximum date range is limited to 1 year
    - To date cannot exceed 15 months from the current date
  - Clear visual indicators for date selection

- **Submit Request**: After selecting a control and date range
  - A confirmation dialog appears before submission
  - Upon successful submission, a success dialog displays the unique **Request ID**

#### Request History Table
View all previous evidence requests with the following details:

| Column | Description |
|--------|-------------|
| Request ID | Unique identifier for the request |
| Control ID | The IAM control ID (e.g., C.IT.IACTM.004) |
| Date From | Start of the evidence period |
| Date To | End of the evidence period |
| Status | Current status: **In Progress**, **Completed**, or **Failed** |

#### History Table Actions
- **Sort**: Click column headers to sort ascending/descending
- **Search**: Filter requests by Control ID, Request ID, status, or date range
- **View**: View the evidence report details for completed requests
- **Download**: Export evidence reports to Excel format

---

## Screen 2: Documentation

This screen provides access to reference materials and documentation for PBC controls and evidence requirements.

### Features

#### EO+T Document Central Access
- Central hub for all PBC-related documentation
- Single-click access via the **"Open EO+T Document Central"** button
- Opens in a new browser tab for easy reference while working
- Contains:
  - Control definitions and requirements
  - Evidence specifications
  - Process guidelines
  - Reference materials for auditors

---

## Navigation

The PBC Automation System features a consistent navigation bar across all screens:

| Navigation Element | Description |
|-------------------|-------------|
| **Home** | Return to the main application landing page |
| **Control Execution Evidence** | Navigate to the evidence request screen |
| **Documentation** | Access the documentation screen |

### Header Elements
- **Freddie Mac Logo**: Branding and identity
- **Application Title**: "PBC Automation System"
- **Current Date**: Today's date display
- **User Information**: Logged-in user details with dropdown menu
- **Theme Toggle**: Switch between light and dark mode

---

## Supported Controls

The system supports the following automated controls:
- C.IT.IACTM.004
- C.IT.IACTM.001
- C.IT.IACTM.010
- C.IT.IACTM.008
- C.IT.IACTM.017
- C.IT.IACTM.031
- C.IT.IACTM.007
- C.IT.IACTM.006
- C.IT.CRM.121

*For the complete list of all 43 controls and their requirements, please refer to the EO+T Document Central.*

---

## Quick Start Guide

1. **Navigate** to the PBC Automation System from the landing page
2. **Select a Control** from the dropdown menu
3. **Choose your Date Range** (From and To dates)
4. **Click Submit** and confirm your request
5. **Note your Request ID** from the success dialog
6. **Track progress** in the Request History table
7. **Download evidence** once the status shows "Completed"

---

*For additional support or questions, please contact your system administrator.*
