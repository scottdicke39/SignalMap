// Real Glean API Client for Handshake
// This replaces the mock implementation with actual Glean API calls

interface GleanConfig {
  baseUrl: string;
  apiKey: string;
  bearerToken?: string;
}

interface GleanPerson {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
  manager?: {
    id: string;
    name: string;
    title: string;
  };
  directReports?: GleanPerson[];
}

interface GleanOrgChartResponse {
  person: GleanPerson;
  team: GleanPerson[];
  crossFunctional?: GleanPerson[];
}

export class GleanClient {
  private config: GleanConfig;
  
  constructor(config: GleanConfig) {
    this.config = config;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers as Record<string, string>
    };

    // Add authentication - Glean uses Bearer token format
    if (this.config.bearerToken) {
      headers['Authorization'] = `Bearer ${this.config.bearerToken}`;
    } else if (this.config.apiKey) {
      // Glean API uses Bearer token authentication
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`Glean API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Glean API request failed:', error);
      throw new Error(`Failed to connect to Glean: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Search for a person by name
  async searchPerson(name: string): Promise<GleanPerson[]> {
    try {
      // Glean search API endpoint - uses /search with datasource filter
      const searchResults = await this.makeRequest('/search', {
        method: 'POST',
        body: JSON.stringify({
          query: name,
          pageSize: 10,
          datasources: ['PEOPLE'],
          requestOptions: {
            datasourceFilter: ['PEOPLE']
          }
        })
      });

      return searchResults.results || [];
    } catch (error) {
      console.error(`Failed to search for person "${name}":`, error);
      return [];
    }
  }

  // Get org chart data for a specific person
  async getOrgChart(personId: string): Promise<GleanOrgChartResponse | null> {
    try {
      // Get the person's org chart info
      const orgData = await this.makeRequest(`/api/orgchart/person/${personId}`);
      
      return {
        person: orgData.person,
        team: orgData.directReports || [],
        crossFunctional: orgData.crossFunctional || []
      };
    } catch (error) {
      console.error(`Failed to get org chart for person ${personId}:`, error);
      return null;
    }
  }

  // Get org context by manager name (high-level method)
  async getOrgContextByManager(managerName: string): Promise<{
    manager: string;
    department: string;
    team: string[];
    crossFunc: string[];
  }> {
    try {
      // Step 1: Search for the manager
      const searchResults = await this.searchPerson(managerName);
      
      if (searchResults.length === 0) {
        throw new Error(`No person found with name "${managerName}"`);
      }

      // Use the first/best match
      const manager = searchResults[0];

      // Step 2: Get their org chart
      const orgChart = await this.getOrgChart(manager.id);
      
      if (!orgChart) {
        throw new Error(`Could not retrieve org chart for ${managerName}`);
      }

      // Step 3: Format the response
      const team = orgChart.team.map(person => `${person.name} - ${person.title}`);
      const crossFunc = (orgChart.crossFunctional || []).map(person => `${person.name} - ${person.title}`);

      return {
        manager: `${manager.name} - ${manager.title}`,
        department: manager.department || 'Unknown',
        team: team,
        crossFunc: crossFunc
      };

    } catch (error) {
      console.error('Failed to get org context:', error);
      throw error;
    }
  }

  // Query Glean AI Agent for conversational Q&A
  async queryAgent(agentId: string, question: string): Promise<{
    success: boolean;
    answer?: string;
    error?: string;
  }> {
    try {
      console.log(`🤖 Querying Glean Agent ${agentId}: "${question}"`);
      
      const response = await this.makeRequest('/chat/query', {
        method: 'POST',
        body: JSON.stringify({
          agentId,
          question
        })
      });

      // Extract answer from response (structure may vary)
      const answer = response.answer || response.text || response.content;
      
      if (!answer) {
        throw new Error('No answer returned from Glean Agent');
      }

      return {
        success: true,
        answer
      };
    } catch (error) {
      console.error('Glean Agent query failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Ask the RecruitingBot Glean Agent a question
  async askRecruitingAgent(question: string): Promise<{
    success: boolean;
    answer?: string;
    error?: string;
  }> {
    // Your RecruitingBot Glean Agent ID
    const RECRUITING_AGENT_ID = '058a5f966a1345aeb415ec5482e85594';
    return this.queryAgent(RECRUITING_AGENT_ID, question);
  }

  // Test connection to Glean
  async testConnection(): Promise<boolean> {
    try {
      // Try a simple search to test connectivity
      await this.makeRequest('/search', {
        method: 'POST',
        body: JSON.stringify({
          query: 'test',
          pageSize: 1
        })
      });
      return true;
    } catch (error) {
      console.error('Glean connection test failed:', error);
      return false;
    }
  }
}

// Alternative API endpoints that Glean might use:
// - /api/v1/search
// - /directory/api/people/search  
// - /api/people/search
// - /graphql (if using GraphQL)

export default GleanClient;








