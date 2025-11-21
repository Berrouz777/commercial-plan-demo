<template>
    <div
        ref="tooltip"
        :class="$style.GenplanCommercialTooltip"
        :style="position"
        @mouseenter="onClearTooltipTimer"
        @mouseleave="onStartTooltipTimer"
    >
        <ul :class="$style.props">
            <LotPropRow
                v-for="(prop, index) in properties"
                :key="`prop-${index}`"
                :prop="prop"
                tag="li"
                is-popup
                is-commercial
                is-small
            />
        </ul>

        <DefaultButton
            :class="[$style.button, 'cursor-pointer']"
            @click="onOpenBuilding"
            v-html="strMore"
        />
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import { getStrArea } from '@/assets/js/utils';
import { utmLinkMixin } from '@/assets/js/mixins/utmLinkMixin';

import LotPropRow from '@/components/common/lot/LotPropRow';
import DefaultButton from '@/components/ui/button/DefaultButton';

const PADDING = 40; // Расстояние между тултипом и краем экрана
const MORE = 'Подробнее';

export default {
    name: 'GenplanCommercialTooltip',

    components: {
        LotPropRow,
        DefaultButton,
    },

    mixins: [utmLinkMixin],

    props: {
        space: {
            type: Object,
            default: () => ({}),
        },

        mouse: {
            type: Object,
            default: () => ({}),
        },

        containerData: {
            type: Object,
            default: () => ({}),
        },

        relatedSpaces: {
            type: Array,
            default: () => [],
        },
    },

    data() {
        return {
            tooltipHeight: null,
            tooltipWidth: null,
            tooltipTimer: null,
            cursorOffset: { x: 40, y: 20 },
            containerOffset: { x: 0, y: 25 },
        };
    },

    computed: {
        position() {
            if (this.$device.isMobile) {
                return {};
            }

            const tooltipHeight = this.tooltipHeight;
            const tooltipWidth = this.tooltipWidth;

            const pointerX = this.mouse.left;
            const pointerY = this.mouse.top;

            const genplanOffsetY = this.containerData.genplanOffsetY;
            const genplanOffsetX = this.containerData.genplanOffsetX;

            const windowHeight = this.getWindowHeight();
            const windowWidth = this.getWindowWidth();

            const isTop = pointerY - windowHeight < this.containerOffset.y + PADDING;

            const y = this.getCalculateY(pointerY, genplanOffsetY, tooltipHeight, windowHeight, isTop);
            const x = this.getCalculateX(pointerX, genplanOffsetX, tooltipWidth, windowWidth);

            return {
                top: `${y}px`,
                left: `${x}px`,
            };
        },

        properties() {
            const middleCommercial = this.relatedSpaces.length && this.space.middle_commercial.length ? this.space.middle_commercial[0] : {};

            return [
                {
                    label: 'Ввод в эксплуатацию — 4 кв. 2024',
                    value: `Помещение №${this.space.number}`,
                    reverse: true,
                    img: this.space.schema_svg,
                },
                {
                    label: 'Площадь помещения',
                    value: `${this.space.area}`,
                    measure: 'м²',
                    related: true,
                    relatedTooltip: getStrArea(this.relatedSpaces),
                    relatedId: middleCommercial ? middleCommercial.id : null,
                    relatedArea: middleCommercial ? middleCommercial.area : null,
                    popupDesk: true,
                },
                {
                    label: 'Назначение',
                    value: this.space.custom_group ? this.space.custom_group : '',
                },
            ];
        },

        strMore() {
            return MORE;
        },
    },

    mounted() {
        this.tooltipHeight = this.$refs.tooltip.offsetHeight;
        this.tooltipWidth = this.$refs.tooltip.offsetWidth;
        this.onStartTooltipTimer();
    },

    beforeDestroy() {
        this.onClearTooltipTimer();
    },

    methods: {
        ...mapActions({
            setActiveTooltip: 'line-animate/setActiveTooltip',
        }),

        onOpenBuilding() {
            this.setActiveTooltip(null);

            const path = this.$router.resolve({
                name: 'commercial-id',
                params: { id: this.space.id },
            }).href;

            const route = this.getCurrentLink(path, true);

            this.$router.push(route);
        },

        onStartTooltipTimer() {
            this.onClearTooltipTimer();
            this.tooltipTimer = setTimeout(() => {
                this.$emit('mouseleave');
            }, 5000);
        },

        onClearTooltipTimer() {
            if (this.tooltipTimer) {
                clearTimeout(this.tooltipTimer);
                this.tooltipTimer = null;
            }
        },

        getWindowHeight() {
            return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        },

        getWindowWidth() {
            return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        },

        getCalculateY(pointerY, genplanOffsetY, tooltipHeight, genplanHeight, isTop) {
            let y;

            if (isTop) {
                y = pointerY - genplanOffsetY + this.cursorOffset.y;

                if (y + tooltipHeight + PADDING > genplanHeight) {
                    y = genplanHeight - tooltipHeight - PADDING;
                }
            } else {
                y = pointerY - genplanOffsetY - tooltipHeight - this.cursorOffset.y;

                if (y < PADDING) {
                    y = PADDING;
                }
            }

            return y;
        },

        getCalculateX(pointerX, genplanOffsetX, tooltipWidth, genplanWidth) {
            if (pointerX + this.containerOffset.x + this.cursorOffset.x + tooltipWidth > genplanWidth - PADDING) {
                return genplanWidth - tooltipWidth - this.containerOffset.x - PADDING;
            } else if (pointerX + this.cursorOffset.x < this.containerOffset.x + PADDING) {
                return this.containerOffset.x + PADDING;
            } else {
                return pointerX + this.cursorOffset.x - genplanOffsetX;
            }
        },
    },
};
</script>

<style lang="scss" module>
    .GenplanCommercialTooltip {
        position: absolute;
        z-index: 10;
        width: 38rem;
        padding: 2.4rem 2rem;
        background: $main-white;
        box-shadow: $box-shadow;

        @include respond-to(xs) {
            display: none;
        }
    }

    .button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        margin-top: 1.6rem;
        padding: 1.1rem 0;
        background: $dark-main;
        line-height: 1.32;
        color: $light-support;
        transition: background .3s ease-in-out;

        @include hover {
            &:hover {
                background: rgba($dark-main, .8);
            }
        }
    }
</style>

