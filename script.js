class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.editingTaskId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.addSampleTasks();
        this.render();
        this.updateProgress();
    }

    initializeElements() {
        // Input elements
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.editTaskInput = document.getElementById('editTaskInput');
        
        // Display elements
        this.tasksContainer = document.getElementById('tasksContainer');
        this.emptyState = document.getElementById('emptyState');
        this.totalTasksEl = document.getElementById('totalTasks');
        this.completedTasksEl = document.getElementById('completedTasks');
        this.progressFill = document.getElementById('progressFill');
        this.progressPercentage = document.getElementById('progressPercentage');
        this.progressMessage = document.getElementById('progressMessage');
        
        // Filter tabs
        this.filterTabs = document.querySelectorAll('.filter-tab');
        
        // Modal elements
        this.editModal = document.getElementById('editModal');
        this.closeModalBtn = document.getElementById('closeModal');
        this.cancelEditBtn = document.getElementById('cancelEdit');
        this.saveEditBtn = document.getElementById('saveEdit');
    }

    bindEvents() {
        // Add task events
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Filter events
        this.filterTabs.forEach(tab => {
            tab.addEventListener('click', () => this.setFilter(tab.dataset.filter));
        });

        // Modal events
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.cancelEditBtn.addEventListener('click', () => this.closeModal());
        this.saveEditBtn.addEventListener('click', () => this.saveEdit());
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) this.closeModal();
        });

        // Edit task input event
        this.editTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveEdit();
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.editModal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    addSampleTasks() {
        const sampleTasks = [
            { 
                id: 'sample-1', 
                text: 'Plan weekend getaway ✈️', 
                completed: false, 
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() 
            },
            { 
                id: 'sample-2', 
                text: 'Finish reading that book I started', 
                completed: true, 
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            { 
                id: 'sample-3', 
                text: 'Try that new coffee shop downtown ☕', 
                completed: false, 
                createdAt: new Date().toISOString() 
            }
        ];
        
        this.tasks = sampleTasks;
    }

    addTask() {
        const text = this.taskInput.value.trim();
        
        if (!text) {
            this.taskInput.focus();
            return;
        }

        const task = {
            id: this.generateId(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.taskInput.value = '';
        this.render();
        this.updateProgress();
        
        // Add celebration animation
        this.addTaskBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.addTaskBtn.style.transform = '';
        }, 150);
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.render();
            this.updateProgress();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.render();
        this.updateProgress();
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.editingTaskId = id;
            this.editTaskInput.value = task.text;
            this.openModal();
        }
    }

    saveEdit() {
        const text = this.editTaskInput.value.trim();
        if (!text) return;

        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            task.text = text;
            this.render();
            this.closeModal();
        }
    }

    openModal() {
        this.editModal.classList.add('active');
        setTimeout(() => this.editTaskInput.focus(), 100);
    }

    closeModal() {
        this.editModal.classList.remove('active');
        this.editingTaskId = null;
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active tab
        this.filterTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });
        
        this.render();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            default:
                return this.tasks;
        }
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    createTaskElement(task) {
        const taskEl = document.createElement('div');
        taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskEl.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                 onclick="taskManager.toggleTask('${task.id}')">
            </div>
            <div class="task-content">
                <div class="task-text">${this.escapeHtml(task.text)}</div>
                <div class="task-time">
                    Created ${this.formatTime(task.createdAt)}
                    ${task.completed ? ` • Completed ${this.formatTime(task.completedAt)}` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn edit-btn" onclick="taskManager.editTask('${task.id}')" 
                        title="Edit task">
                    ✎
                </button>
                <button class="action-btn delete-btn" onclick="taskManager.deleteTask('${task.id}')" 
                        title="Delete task">
                    🗑
                </button>
            </div>
        `;
        return taskEl;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    render() {
        const filteredTasks = this.getFilteredTasks();
        
        // Clear container
        this.tasksContainer.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            this.emptyState.classList.remove('hidden');
            
            // Update empty state message based on filter
            const emptyMessages = {
                'all': 'No tasks yet! Add your first task above to get started on your productivity journey.',
                'completed': 'No completed tasks yet. Time to check some items off your list! 🎯',
                'pending': 'All tasks completed! You\'re crushing it today! 🎉'
            };
            
            this.emptyState.querySelector('p').textContent = emptyMessages[this.currentFilter];
        } else {
            this.emptyState.classList.add('hidden');
            
            filteredTasks.forEach(task => {
                const taskEl = this.createTaskElement(task);
                this.tasksContainer.appendChild(taskEl);
            });
        }
    }

    updateProgress() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // Update stats
        this.totalTasksEl.textContent = totalTasks;
        this.completedTasksEl.textContent = completedTasks;
        
        // Update progress bar
        this.progressFill.style.width = `${progressPercentage}%`;
        this.progressPercentage.textContent = `${progressPercentage}%`;
        
        // Update progress message with millennial vibes
        const messages = [
            { threshold: 0, message: "Ready to crush some goals? 🎯" },
            { threshold: 25, message: "You're getting started! Keep the momentum going! 💪" },
            { threshold: 50, message: "Halfway there! You're doing amazing! 🌟" },
            { threshold: 75, message: "So close to the finish line! Push through! 🔥" },
            { threshold: 100, message: "YASSS! You absolutely crushed it today! 🎉✨" }
        ];
        
        const currentMessage = messages
            .filter(m => progressPercentage >= m.threshold)
            .pop().message;
            
        this.progressMessage.textContent = currentMessage;
    }
}

// Initialize the task manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});