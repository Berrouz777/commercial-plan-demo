<template>
    <div class="modal-overlay">
        <div class="modal-content">
            <h2>Форма консультации</h2>
            <div class="modal-body">
                <!-- Заглушка модального окна -->
                <p>SelectionModal Component</p>
                <p>Здесь отображается форма для получения консультации</p>
            </div>
            <button @click="$emit('close')">Закрыть</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SelectionModal',
};
</script>

<style scoped>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        max-width: 90vw;
        max-height: 90vh;
    }

    .modal-body {
        margin: 1rem 0;
    }
</style>

