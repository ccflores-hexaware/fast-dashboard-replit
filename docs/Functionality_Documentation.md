# FAST Dashboard: Persona-Based Functional Documentation

**Date:** December 12, 2025
**Version:** 2.0
**Project:** FAST Dashboard Prototype

---

## 1. Executive Summary
The FAST Dashboard is designed to serve two distinct user personas: **Admins**, who manage the data lifecycle, and **Viewers**, who consume information for reporting and analysis. This document outlines the specific capabilities available to each persona across the application's four main modules.

---

## 2. Admin Persona (Full Access)
**Profile:** IT Managers, Asset Controllers, System Administrators.
**Goal:** Maintain data integrity, manage asset lifecycles, and ensure accurate reporting.

### 2.1 General Capabilities (All Pages)
*   **Full Data Visibility:** Access to all data columns in every dashboard.
*   **Data Export:** Capability to export full datasets to Excel for offline backup or migration.
*   **Advanced Filtering:** Use multi-select filters and specific column searches to locate records for maintenance.

### 2.2 Dashboard-Specific Functions

#### A. Fake Asset List (Assets)
*   **Create New Assets:**
    *   **Action:** Click the "Add New" button.
    *   **Function:** Opens a form to register a new IT asset.
    *   **Automation:** The system automatically generates unique Asset IDs if left blank.
*   **Edit Existing Assets:**
    *   **Action:** Click the "Pencil" icon in any row or the "Edit" button in the details card.
    *   **Function:** Update lifecycle status, owners, or descriptions.
    *   **Audit Trail:** Every save automatically records the Admin's name and the timestamp of the change.
*   **Full Column Access:** View sensitive or administrative columns (e.g., Block Funding details, specific NFR compliance flags) that might be hidden from viewers.

#### B. Technology Portfolio Insight (TPI)
*   **Detailed Integration Management:**
    *   View all technical attributes including `Affinity Group`, `App Appr Modern Delivery`, and `KeyChain Onboarding Status`.
    *   Monitor `CMDB Legal Hold` and `CMDB Being Retired` statuses which are critical for compliance.

#### C. Business Technology Office (BTO)
*   **Strategic Alignment:**
    *   View full mapping of `Higher Level BTO` objectives to specific `Divisions`.
    *   Access the `Concat Value` field at the end of the table for data reconciliation.

#### D. Configuration Management Database (CMDB)
*   **Configuration Control:**
    *   View complete Configuration Item (CI) details including `Environment`, `Owner`, and granular `Version` numbers.
    *   Monitor operational `Status` (Operational, Degraded, Offline) to manage system health.

---

## 3. View Persona (Read-Only)
**Profile:** Auditors, Business Stakeholders, General Staff.
**Goal:** Browse portfolio status, check asset details, and generate reports without risk of accidental data modification.

### 3.1 General Capabilities (All Pages)
*   **Safe Browsing:** Interface is strictly read-only. No "Add," "Edit," or "Save" buttons are visible, preventing accidental changes.
*   **Simplified View:**
    *   **Table Limit:** Automatically restricted to seeing only the **first 20 most important columns** to reduce information overload.
    *   **Card Limit:** Pop-up details are also streamlined to show only the essential 20 fields.
*   **Self-Service Reporting:**
    *   **Excel Export:** Full permission to download the currently filtered view to Excel for meetings or presentations.
    *   **Search & Filter:** Full access to global search, column-specific search, and status filtering to find specific information independently.

### 3.2 Dashboard-Specific Functions

#### A. Fake Asset List (Assets)
*   **Asset Lookup:** Quickly find assets by ID or Name to check their `Status` or `Owner`.
*   **Status Monitoring:** Use the visual status badges (Green/Yellow/Red) to identify active vs. retired assets.
*   **Contact Identification:** Easily look up `Business Owner` or `IT Owner` for specific assets to initiate communication outside the tool.

#### B. Technology Portfolio Insight (TPI)
*   **Integration Visibility:** View key integration points and `CMDB Status`.
*   **Key Attributes:** Access the most critical 20 attributes (e.g., `Asset Type`, `Hosted` location, `Classification`) without getting lost in deep technical metadata.

#### C. Business Technology Office (BTO)
*   **Objective Tracking:** See which `BTO` objectives align with their `Division`.
*   **Simplified Layout:** The complex `Concat Value` column is moved to the end or hidden (depending on the 20-column limit) to focus on the primary business goals.

#### D. Configuration Management Database (CMDB)
*   **Health Check:** Quickly check the `Status` of critical Configuration Items.
*   **Environment Awareness:** Verify if a system is in `Production`, `Staging`, or `Development` without seeing deep configuration details.

---

## 4. Feature Comparison Matrix

| Feature | Admin Persona | View Persona |
| :--- | :---: | :---: |
| **Add New Records** | ✅ | ❌ |
| **Edit Existing Records** | ✅ | ❌ |
| **View All Columns** | ✅ | ❌ (Top 20 Only) |
| **Export to Excel** | ✅ | ✅ |
| **Global Search** | ✅ | ✅ |
| **Column Filters** | ✅ | ✅ |
| **Audit Logging** | ✅ (Creates Logs) | ❌ (View Logs Only) |
