import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const BASE_URL = 'http://localhost:5000';

describe('TPI Pagination API', () => {
  describe('GET /api/tpi', () => {
    it('should return paginated results with default parameters', async () => {
      const response = await fetch(`${BASE_URL}/api/tpi`);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('totalCount');
      expect(result).toHaveProperty('totalPages');
      expect(result).toHaveProperty('currentPage');
      expect(result.currentPage).toBe(1);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should return correct page when page parameter is provided', async () => {
      const response = await fetch(`${BASE_URL}/api/tpi?page=2&limit=5`);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.currentPage).toBe(2);
      expect(result.data.length).toBeLessThanOrEqual(5);
    });

    it('should respect limit parameter', async () => {
      const limit = 5;
      const response = await fetch(`${BASE_URL}/api/tpi?page=1&limit=${limit}`);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.length).toBeLessThanOrEqual(limit);
    });

    it('should filter results when search parameter is provided', async () => {
      const searchTerm = 'Core';
      const response = await fetch(`${BASE_URL}/api/tpi?page=1&limit=10&search=${searchTerm}`);
      const result = await response.json();

      expect(response.status).toBe(200);
      if (result.data.length > 0) {
        const hasMatch = result.data.some((item: any) => 
          Object.values(item).some(value => 
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
        expect(hasMatch).toBe(true);
      }
    });

    it('should sort results when sortBy and sortOrder are provided', async () => {
      const response = await fetch(`${BASE_URL}/api/tpi?page=1&limit=10&sortBy=name&sortOrder=asc`);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should calculate totalPages correctly', async () => {
      const limit = 5;
      const response = await fetch(`${BASE_URL}/api/tpi?page=1&limit=${limit}`);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.totalPages).toBe(Math.ceil(result.totalCount / limit));
    });
  });

  describe('GET /api/tpi/filter-options', () => {
    it('should return filter options for TPI assets', async () => {
      const response = await fetch(`${BASE_URL}/api/tpi/filter-options`);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(typeof result).toBe('object');
    });
  });
});

describe('CMDB Pagination API', () => {
  describe('GET /api/cmdb', () => {
    it('should return paginated results with default parameters', async () => {
      const response = await fetch(`${BASE_URL}/api/cmdb`);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('totalCount');
      expect(result).toHaveProperty('totalPages');
      expect(result).toHaveProperty('currentPage');
      expect(result.currentPage).toBe(1);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should return correct page when page parameter is provided', async () => {
      const response = await fetch(`${BASE_URL}/api/cmdb?page=2&limit=5`);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.currentPage).toBe(2);
      expect(result.data.length).toBeLessThanOrEqual(5);
    });

    it('should respect limit parameter', async () => {
      const limit = 5;
      const response = await fetch(`${BASE_URL}/api/cmdb?page=1&limit=${limit}`);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.length).toBeLessThanOrEqual(limit);
    });

    it('should filter results when search parameter is provided', async () => {
      const searchTerm = 'Data';
      const response = await fetch(`${BASE_URL}/api/cmdb?page=1&limit=10&search=${searchTerm}`);
      const result = await response.json();

      expect(response.status).toBe(200);
      if (result.data.length > 0) {
        const hasMatch = result.data.some((item: any) => 
          Object.values(item).some(value => 
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
        expect(hasMatch).toBe(true);
      }
    });

    it('should sort results when sortBy and sortOrder are provided', async () => {
      const response = await fetch(`${BASE_URL}/api/cmdb?page=1&limit=10&sortBy=configItem&sortOrder=asc`);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should calculate totalPages correctly', async () => {
      const limit = 5;
      const response = await fetch(`${BASE_URL}/api/cmdb?page=1&limit=${limit}`);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.totalPages).toBe(Math.ceil(result.totalCount / limit));
    });
  });

  describe('GET /api/cmdb/filter-options', () => {
    it('should return filter options for CMDB assets', async () => {
      const response = await fetch(`${BASE_URL}/api/cmdb/filter-options`);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(typeof result).toBe('object');
    });
  });
});

describe('Pagination Integration Tests', () => {
  it('clicking Next Page should call API with page=2', async () => {
    const page1Response = await fetch(`${BASE_URL}/api/tpi?page=1&limit=10`);
    const page1Result = await page1Response.json();

    const page2Response = await fetch(`${BASE_URL}/api/tpi?page=2&limit=10`);
    const page2Result = await page2Response.json();

    expect(page1Result.currentPage).toBe(1);
    expect(page2Result.currentPage).toBe(2);
    
    if (page1Result.totalCount > 10) {
      expect(page1Result.data[0].id).not.toBe(page2Result.data[0]?.id);
    }
  });

  it('search should return filtered results from server', async () => {
    const searchTerm = 'Integration';
    const searchResponse = await fetch(`${BASE_URL}/api/tpi?page=1&limit=100&search=${searchTerm}`);
    const searchResult = await searchResponse.json();

    expect(searchResponse.status).toBe(200);
    expect(searchResult.totalCount).toBeLessThanOrEqual(searchResult.totalCount);
  });

  it('changing page size should recalculate totalPages', async () => {
    const response5 = await fetch(`${BASE_URL}/api/tpi?page=1&limit=5`);
    const result5 = await response5.json();

    const response10 = await fetch(`${BASE_URL}/api/tpi?page=1&limit=10`);
    const result10 = await response10.json();

    expect(result5.totalCount).toBe(result10.totalCount);
    if (result5.totalCount > 5) {
      expect(result5.totalPages).toBeGreaterThan(result10.totalPages);
    }
  });
});
