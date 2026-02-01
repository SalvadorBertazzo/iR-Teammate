// Modal component

let currentModal = null;

export function showModal(options) {
    const { title, content, onClose, size = 'md' } = options;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl'
    };

    const container = document.getElementById('modal-container');

    container.innerHTML = `
        <div class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg border border-gray-200 shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col">
                <div class="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
                    <button class="modal-close-btn text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-content p-4 overflow-y-auto">
                    ${content}
                </div>
            </div>
        </div>
    `;

    // Close handlers
    const backdrop = container.querySelector('.modal-backdrop');
    const closeBtn = container.querySelector('.modal-close-btn');

    const close = () => {
        container.innerHTML = '';
        currentModal = null;
        if (onClose) onClose();
    };

    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) close();
    });

    closeBtn.addEventListener('click', close);

    // Close on Escape
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            close();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    currentModal = { close, element: container };
    return currentModal;
}

export function closeModal() {
    if (currentModal) {
        currentModal.close();
    }
}

export function getModalContent() {
    const container = document.getElementById('modal-container');
    return container.querySelector('.modal-content');
}

export function showConfirm(options) {
    const { title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, danger = false } = options;

    const confirmClass = danger
        ? 'bg-red-600 hover:bg-red-700'
        : 'bg-blue-600 hover:bg-blue-700';

    const content = `
        <p class="text-gray-600 mb-6">${message}</p>
        <div class="flex gap-3">
            <button id="modal-confirm" class="${confirmClass} text-white font-medium py-2 px-4 rounded-md flex-1 transition-colors">
                ${confirmText}
            </button>
            <button id="modal-cancel" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md flex-1 transition-colors">
                ${cancelText}
            </button>
        </div>
    `;

    const modal = showModal({ title, content, size: 'sm' });

    document.getElementById('modal-confirm').addEventListener('click', () => {
        modal.close();
        if (onConfirm) onConfirm();
    });

    document.getElementById('modal-cancel').addEventListener('click', () => {
        modal.close();
        if (onCancel) onCancel();
    });

    return modal;
}
