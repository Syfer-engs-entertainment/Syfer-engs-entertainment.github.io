class UI {
    static init() {
        this.bindEvents();
        this.loadRepositories();
    }

    static bindEvents() {
        document.getElementById('new-repo-btn').addEventListener('click', () => {
            this.showModal('new-repo-modal');
        });

        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
        });

        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.hideModal(e.target.closest('.modal').id);
            });
        });

        document.getElementById('new-repo-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleNewRepository(e.target);
        });
    }

    static async loadRepositories() {
        try {
            const repos = await GitHubAPI.getRepositories();
            this.renderRepositories(repos);
        } catch (error) {
            Utils.showToast('Failed to load repositories', 'error');
        }
    }

    static renderRepositories(repos) {
        const repoList = document.getElementById('repo-list');
        repoList.innerHTML = repos.map(repo => `
            <div class="repo-card">
                <h3>${repo.name}</h3>
                <p>${repo.description || 'No description'}</p>
                <div class="repo-stats">
                    <span>${repo.stargazers_count} ⭐</span>
                    <span>${repo.forks_count} 🍴</span>
                </div>
                <button class="button" onclick="UI.exploreRepository('${repo.full_name}')">
                    Explore
                </button>
            </div>
        `).join('');
    }

    static async handleNewRepository(form) {
        const data = {
            name: form['repo-name'].value,
            description: form['repo-description'].value,
            private: form['repo-private'].checked,
            auto_init: true
        };

        try {
            const repo = await GitHubAPI.createRepository(data);
            Utils.showToast('Repository created successfully', 'success');
            this.hideModal('new-repo-modal');
            this.loadRepositories();
        } catch (error) {
            Utils.showToast('Failed to create repository', 'error');
        }
    }

    static showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    static hideModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    static switchView(view) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(`${view}-view`).classList.add('active');
    }
}
