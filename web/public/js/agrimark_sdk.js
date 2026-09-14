class AgriMarkSDK {
    constructor(apiKey, baseUrl = '/api/v1') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    async getDatasets() {
        return { status: 'SUCCESS', datasets: ['Tamil Nadu Acreage', 'Salem Mandi Prices'] };
    }

    async runSyntheticData(domain = 'PRICES', count = 10) {
        return { status: 'SUCCESS', domain, count, synthetic: true };
    }
}
window.AgriMarkSDK = AgriMarkSDK;
