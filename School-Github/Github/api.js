class GitHubAPI {
    static async getUser() {
        const response = await fetch(`${config.apiBaseUrl}/user`, {
            headers: config.headers
        });
        return await response.json();
    }

    static async getRepositories(page = 1) {
        const response = await fetch(
            `${config.apiBaseUrl}/user/repos?page=${page}&per_page=${config.perPage}`,
            { headers: config.headers }
        );
        return await response.json();
    }

    static async createRepository(data) {
        const response = await fetch(`${config.apiBaseUrl}/user/repos`, {
            method: 'POST',
            headers: config.headers,
            body: JSON.stringify(data)
        });
        return await response.json();
    }

    static async getBranches(fullName) {
        const response = await fetch(
            `${config.apiBaseUrl}/repos/${fullName}/branches`,
            { headers: config.headers }
        );
        return await response.json();
    }

    static async createBranch(fullName, branchName, sha) {
        const response = await fetch(
            `${config.apiBaseUrl}/repos/${fullName}/git/refs`,
            {
                method: 'POST',
                headers: config.headers,
                body: JSON.stringify({
                    ref: `refs/heads/${branchName}`,
                    sha: sha
                })
            }
        );
        return await response.json();
    }

    static async getContents(fullName, path = '', ref = '') {
        const response = await fetch(
            `${config.apiBaseUrl}/repos/${fullName}/contents/${path}${ref ? `?ref=${ref}` : ''}`,
            { headers: config.headers }
        );
        return await response.json();
    }

    static async updateFile(fullName, path, content, sha, message, branch) {
        const response = await fetch(
            `${config.apiBaseUrl}/repos/${fullName}/contents/${path}`,
            {
                method: 'PUT',
                headers: config.headers,
                body: JSON.stringify({
                    message,
                    content: btoa(content),
                    sha,
                    branch
                })
            }
        );
        return await response.json();
    }
}
