import { BigQuery } from '@google-cloud/bigquery';
import { OAuth2Client } from 'google-auth-library';

export const insertMetricsToBigQuery = async (accessToken: string, rows: any[]) => {
 
    const client = new OAuth2Client();
    client.setCredentials({ access_token: accessToken });

    
    const bigquery = new BigQuery({
        projectId: 'data-from-software',
        authClient: client
    });

    const datasetId = 'benchmarking_warehouse';
    const tableId = 'daily_query_metrics';

    try {
      
        await bigquery.dataset(datasetId).table(tableId).insert(rows);
        return []; 
    } catch (error: any) {
       
        if (error.name === 'PartialFailureError') {
            return error.errors; 
        }
        throw error;
    }
};