<template>
    <div :class="[genplanClassList, 'genplan']">
        <transition
            name="fade"
            mode="out-in"
        >
            <GenplanLot
                v-if="values.view === 'flat' || values.view === 'commercial-lot'"
                class="gp-lot"
                :lot="flat"
                :values="values"
                :zoomed="zoomed"
                :in-modal="inModal"
                :not-handle-wheel="notHandleWheel"
            />

            <GenplanFloor
                v-if="values.view === 'flats'"
                :plan="plan"
                :flat="flat"
                :floor="floor"
                :zoomed="zoomed"
                :is-flat-page="isFlatPage"
                @click-hover="$emit('click-flat', $event)"
            />

            <GenplanPhase
                v-if="values.view === 'phase' && values.mode !== 'buildings'"
                :flat="flat"
                :plan="plan"
                :project="project"
                :buildings="buildings"
                :values="values"
                :zoomed="zoomed"
                :not-handle-wheel="notHandleWheel"
                @click-hover="$emit('click-hover', $event)"
            />

            <GenplanBuildings
                v-if="values.view === 'buildings'"
                :flat="flat"
                :project="project"
                :window="window"
                :plan="plan"
                :zoomed="zoomed"
            />

            <GenplanCommercial
                v-if="values.view === 'commercial'"
                :lot="flat"
                :floor="floor"
                :buildings="buildings"
                :values="values"
                :zoomed="zoomed"
                :active-group-building="activeGroupBuilding"
                :is-animation-genplan="isAnimationGenplan"
                @onMouseEnter="$emit('onMouseEnter')"
                @onMouseLeave="$emit('onMouseLeave')"
                @click-hover="$emit('click-hover', $event)"
                @click-icon="$emit('click-icon', $event)"
                @reset-buildings="$emit('reset-buildings', $event)"
            />

            <GenplanPhaseParameters
                v-if="values.view === 'phase' && values.mode === 'buildings'"
                :flat="flat"
                :plan="plan"
                :project="project"
                :buildings="buildings"
                :values="values"
                :zoomed="zoomed"
                :is-params-page="isParamsPage"
                @click-hover="$emit('click-hover', $event)"
            />
        </transition>
    </div>
</template>

<script>
// Примечание: Это упрощенная версия компонента Genplan.
// Оригинальный компонент использует множество зависимостей:
// - GenplanLot, GenplanFloor, GenplanPhase, GenplanBuildings, GenplanCommercial, GenplanPhaseParameters
// - Каждый из этих компонентов также имеет свои зависимости
// Для демонстрации архитектуры показана структура компонента-роутера

import GenplanLot from '@/components/pages/flats/genplan/GenplanLot';
import GenplanFloor from '@/components/pages/flats/genplan/GenplanFloor';
import GenplanPhase from '@/components/pages/flats/genplan/GenplanPhase';
import GenplanBuildings from '@/components/pages/flats/genplan/GenplanBuildings';
import GenplanCommercial from '@/components/pages/flats/genplan/GenplanCommercial';
import GenplanPhaseParameters from '@/components/pages/flats/genplan/GenplanPhaseParameters';

export default {
    name: 'Genplan',

    components: {
        GenplanLot,
        GenplanFloor,
        GenplanPhase,
        GenplanBuildings,
        GenplanCommercial,
        GenplanPhaseParameters,
    },

    props: {
        flat: {
            type: Object,
            default: () => ({}),
        },

        floor: {
            type: Object,
            default: () => ({}),
        },

        buildings: {
            type: Array,
            default: () => [],
        },

        project: {
            type: Object,
            default: () => ({}),
        },

        values: {
            type: Object,
            default: () => ({}),
        },

        zoomed: {
            type: Boolean,
            default: false,
        },

        notHandleWheel: {
            type: Boolean,
            default: false,
        },

        commercial: {
            type: Boolean,
            default: false,
        },

        absolute: {
            type: Boolean,
            default: false,
        },

        isFlatPage: {
            type: Boolean,
            default: false,
        },

        isParamsPage: {
            type: Boolean,
            default: false,
        },

        activeGroupBuilding: {
            type: String,
            default: '',
        },

        isAnimationGenplan: {
            type: Boolean,
            default: false,
        },

        inModal: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            plan: {
                width: 1440,
                height: 900,
            },

            window: {
                width: 0,
                height: 0,
            },

            isTicking: false,
        };
    },

    computed: {
        genplanClassList() {
            return [
                this.commercial ? 'is-commercial' : '',
                this.absolute ? 'is-absolute' : '',
                this.zoomed ? 'is-zoomed' : '',
            ];
        },
    },

    mounted() {
        window.addEventListener('resize', this.onResize);
        this.updateWindowSize();
    },

    beforeDestroy() {
        window.removeEventListener('resize', this.onResize);
    },

    methods: {
        onResize() {
            if (!this.isTicking) {
                this.isTicking = true;
                requestAnimationFrame(this.updateWindowSize);
            }
        },

        updateWindowSize() {
            this.window.height = window.innerHeight;
            this.window.width = window.innerWidth;
            this.isTicking = false;
        },
    },
};
</script>

<style lang="scss">
    .genplan {
        position: relative;
        width: 100%;
        height: 100%;

        &:focus {
            outline: none;
            outline-width: 0;
        }

        &__content {
            position: absolute;
            top: 0;
            left: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;

            @include respond-to(xs) {
                position: static;
            }
        }

        &__box {
            position: relative;
            width: 61.2rem;
            max-width: 612px;
            max-height: 80%;

            @include aspect-ratio(1, 1);

            @include respond-to(xs) {
                width: 100%;
                max-width: 29rem;
            }

            &--commercial {
                width: 83.7rem;
                min-width: 837px;
                max-width: 102vh;
                max-height: none;

                @include respond-to(xs) {
                    width: 100%;
                    min-width: auto;
                    max-width: none;
                }
            }
        }

        &__background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }

        &.is-commercial {
            position: absolute;
            top: -6rem;
            right: 10rem;
            height: 100%;

            @include respond-to(md) {
                top: 0;
                right: 0;
                height: 100%;
            }

            @include respond-to(xs) {
                height: 95%;
            }
        }

        &.is-absolute {
            position: absolute;
        }

        &.is-zoomed {
            .genplan__box--commercial {
                max-height: none;
            }

            .genplan__content--poi {
                @media screen and (max-width: 400px) {
                    width: 120%;
                }
            }
        }
    }
</style>

