# AgriMark Federation Adapter Reference

## Provider Contracts
Federation adapters integrate third-party providers under common interfaces:
- `AgriculturalDataFederation`
- `MarketDataFederation`
- `WeatherDataFederation`
- `ResearchDataFederation`

## Configured Status Policy
Providers are strictly categorized as `ACTIVE` or `UNCONFIGURED`. AgriMark does not claim live connectivity or integration for unconfigured providers until credentials and endpoints are validated.
