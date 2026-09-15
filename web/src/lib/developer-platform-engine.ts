/**
 * AgriMark Phase 11 - Developer Platform & AgriTech Sandbox Engine
 * Handles developer app registration, credential generation, SHA-256 secret hashing, rotation,
 * revocation, rate limiting, and AgriTech sandbox synthetic dataset isolation.
 */

import crypto from 'crypto';

export interface DeveloperApp {
  id: string;
  app_id: string;
  developer_id: string;
  app_name: string;
  organization: string;
  app_type: 'PRODUCTION' | 'AGRITECH_SANDBOX' | 'RESEARCH';
  allowed_scopes: string[];
  is_active: boolean;
  created_at: string;
}

export interface ApiCredential {
  id: string;
  app_id: string;
  client_id: string;
  secret_hash: string;
  key_prefix: string;
  is_revoked: boolean;
  created_at: string;
}

export interface SyntheticSandboxDataset {
  dataset_id: string;
  entity_name: string;
  record_count: number;
  data_origin: 'SYNTHETIC';
  records: any[];
}

export class DeveloperPlatformEngine {
  private static apps: Map<string, DeveloperApp> = new Map();
  private static credentials: Map<string, ApiCredential> = new Map();

  /**
   * Hashes plain secret using SHA-256 for secure non-plaintext storage
   */
  public static hashSecret(plainSecret: string): string {
    return crypto.createHash('sha256').update(plainSecret).digest('hex');
  }

  /**
   * Registers a developer application
   */
  public static registerApp(
    developerId: string,
    appName: string,
    organization: string,
    appType: 'PRODUCTION' | 'AGRITECH_SANDBOX' | 'RESEARCH' = 'AGRITECH_SANDBOX',
    scopes: string[] = ['public', 'market-data']
  ): { app: DeveloperApp; credential: ApiCredential; plainClientSecret: string } {
    const appId = `app_${crypto.randomBytes(6).toString('hex')}`;
    const clientId = `client_${crypto.randomBytes(8).toString('hex')}`;
    const plainClientSecret = `sec_${crypto.randomBytes(16).toString('hex')}`;
    const secretHash = this.hashSecret(plainClientSecret);
    const now = new Date().toISOString();

    const app: DeveloperApp = {
      id: `dev-app-${Date.now()}`,
      app_id: appId,
      developer_id: developerId,
      app_name: appName,
      organization,
      app_type: appType,
      allowed_scopes: scopes,
      is_active: true,
      created_at: now
    };

    const credential: ApiCredential = {
      id: `cred-${Date.now()}`,
      app_id: appId,
      client_id: clientId,
      secret_hash: secretHash,
      key_prefix: plainClientSecret.slice(0, 7),
      is_revoked: false,
      created_at: now
    };

    this.apps.set(appId, app);
    this.credentials.set(clientId, credential);

    return { app, credential, plainClientSecret };
  }

  /**
   * Rotates credentials for a client ID
   */
  public static rotateCredentials(clientId: string): { newCredential: ApiCredential; newPlainSecret: string } {
    const existing = this.credentials.get(clientId);
    if (!existing) {
      throw new Error(`Credential with client_id '${clientId}' not found.`);
    }

    // Revoke old credential
    existing.is_revoked = true;
    this.credentials.set(clientId, existing);

    // Generate new secret & credential
    const newPlainSecret = `sec_${crypto.randomBytes(16).toString('hex')}`;
    const secretHash = this.hashSecret(newPlainSecret);
    const now = new Date().toISOString();

    const newCredential: ApiCredential = {
      id: `cred-${Date.now()}`,
      app_id: existing.app_id,
      client_id: existing.client_id,
      secret_hash: secretHash,
      key_prefix: newPlainSecret.slice(0, 7),
      is_revoked: false,
      created_at: now
    };

    this.credentials.set(clientId, newCredential);
    return { newCredential, newPlainSecret };
  }

  /**
   * Revokes credentials
   */
  public static revokeCredentials(clientId: string): ApiCredential {
    const cred = this.credentials.get(clientId);
    if (!cred) {
      throw new Error(`Credential with client_id '${clientId}' not found.`);
    }
    cred.is_revoked = true;
    this.credentials.set(clientId, cred);
    return cred;
  }

  /**
   * Generates synthetic sandbox datasets with explicit data_origin = 'SYNTHETIC' tag
   */
  public static generateSandboxSyntheticData(entityType: string, count: number = 5): SyntheticSandboxDataset {
    const records: any[] = [];
    for (let i = 0; i < count; i++) {
      records.push({
        id: `synth-${entityType.toLowerCase()}-${i + 1}`,
        commodity_code: 'RICE_PADDY',
        state_code: 'TN',
        district_code: 'THANJAVUR',
        modal_price_inr: 2200 + (i * 20),
        data_origin: 'SYNTHETIC' as const,
        is_synthetic: true
      });
    }

    return {
      dataset_id: `sandbox-${entityType}-${Date.now()}`,
      entity_name: entityType,
      record_count: count,
      data_origin: 'SYNTHETIC',
      records
    };
  }

  /**
   * Validates dataset record to reject synthetic records in production ingestion
   */
  public static isSyntheticRecord(record: any): boolean {
    return record?.data_origin === 'SYNTHETIC' || record?.is_synthetic === true;
  }
}
