<template>
    <div class="modal-overlay">
        <div class="modal-content">
            <h2>{{ desc || 'Увеличенная схема этажа' }}</h2>
            <div class="modal-body">
                <!-- Заглушка модального окна -->
                <p>GenplanModal Component</p>
                <p>Здесь отображается увеличенная схема генплана</p>
            </div>
            <button @click="$emit('close')">Закрыть</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'GenplanModal',

    props: {
        genplanProps: {
            type: Object,
            default: () => ({}),
        },
        desc: {
            type: String,
            default: '',
        },
        clickHoverHandler: {
            type: Function,
            default: () => {},
        },
        clickIconHandler: {
            type: Function,
            default: () => {},
        },
        isScheme: {
            type: Boolean,
            default: false,
        },
    },
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

