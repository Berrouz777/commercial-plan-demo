<template>
    <div :class="[$style.GenplanCommercial, classes]">
        <div
            ref="visual"
            :class="$style.main"
        >
            <div
                ref="genplan"
                :class="$style.wrap"
                @touchmove="onDrag"
            >
                <template v-if="!$device.isMobile">
                    <transition name="fade">
                        <div
                            :key="getThemeName"
                            v-lazy:background-image="`${values.bg}`"
                            :class="[$style.bg, {[$style._twoLine]: values.floor === 2}]"
                        >
                        </div>
                    </transition>
                </template>

                <GenplanCompass :class="$style.compass" />

                <div
                    v-if="values.animatedBuildings"
                    :class="[$style.genplan, $style._loaded]"
                    class="genplan__box genplan__box--commercial"
                >
                    <transition name="fade">
                        <div
                            v-show="isBuildingsLowered"
                            :class="$style.labels"
                        >
                            <transition-group name="fade">
                                <span
                                    v-for="hover in hovers"
                                    :key="`label-${hover.node.id}`"
                                    :class="getLabelClass(hover.node)"
                                    class="text"
                                    :style="hover.node.label_pos"
                                >
                                    <span v-html="hover.node.tenant"/>
                                </span>

                            </transition-group>
                            <template v-if="isFirstFloor">
                                <span :class="['text', $style.label, $style._dou]">ДОУ</span>
                                <span :class="['text', $style.label, $style._market]">Супермаркет</span>
                            </template>
                        </div>
                    </transition>

                    <div
                        v-for="hover in hovers"
                        v-show="isShowIcon(hover)"
                        :key="`icon-${hover.node.id}`"
                        :style="hover.node.icon_pos"
                        class="commercial-icon"
                        :class="[$style.icon, {[$style._hidden]: isHiddenIcon(hover)}, {[$style._isSecondFloor]: !isFirstFloor}]"
                        @click="onClickIcon(hover.node.group)"
                        @mouseenter="onEnterHoverBuild(hover.node.id)"
                        @mouseleave="onLeaveHoverBuild"
                    >
                        <GenplanCommercialIcons :name="hover.node.group || hover.node.custom_group"/>
                    </div>

                    <svg
                        :class="$style.layer"
                        :viewBox="`0 0 ${floor.width} ${floor.height}`"
                        @click="$emit('reset-buildings', $event)"
                    >
                        <path
                            v-for="path in buildings"
                            :key="`path-${path.id}`"
                            :class="$style.path"
                            :d="path.start"
                            stroke-width="1.5"
                        >
                            <animate
                                v-if="path.start && path.end"
                                ref="pathAnimate"
                                :from="path.start"
                                :to="path.end"
                                attributeName="d"
                                keyTimes="0; 1"
                                keySplines=".25 .1 .25 1"
                                calcMode="spline"
                                dur="800ms"
                                fill="freeze"
                                begin="indefinite"
                            />
                        </path>

                        <g :class="[$style.hoversWrap, {[$style['_visible']]: isBuildingsLowered}]">
                            <GenplanCommercialHover
                                v-for="hover in hovers"
                                :key="hover.node.id"
                                :hover="hover"
                                :active="hover.active"
                                :active-group-building="activeGroupBuilding"
                                :active-lot-id="isActiveLotPolygon(hover)"
                                @mouseenter="onMouseEnter($event, hover.node)"
                                @click="onHoverClick($event, hover)"
                            />
                        </g>
                    </svg>
                </div>

                <div
                    v-else
                    :class="[$style.genplan, {[$style['_loaded']]: isImgLoaded}]"
                    class="genplan__box genplan__box--commercial"
                >
                    <img
                        :src="floor.schema_svg"
                        :class="$style.image"
                        alt="План"
                        @load="handleImgLoad"
                    />

                    <div
                        v-for="hover in hovers"
                        v-show="isShowIcon(hover)"
                        :key="`icon-${hover.node.id}`"
                        :style="hover.node.icon_pos"
                        class="commercial-icon"
                        :class="[$style.icon, {[$style._hidden]: isHiddenIcon(hover)}, {[$style._isSecondFloor]: !isFirstFloor}]"
                        @click="onClickIcon(hover.node.group)"
                        @mouseenter="onEnterHoverBuild(hover.node.id)"
                        @mouseleave="onLeaveHoverBuild"
                    >
                        <GenplanCommercialIcons :name="hover.node.group || hover.node.custom_group"/>
                    </div>

                    <div :class="$style.labels">
                        <transition-group name="fade">
                            <span
                                v-for="hover in hovers"
                                :key="`label-${hover.node.id}`"
                                :class="getLabelClass(hover.node, true)"
                                :style="hover.node.label_pos"
                                class="text"
                            >
                                <span v-html="hover.node.tenant"/>
                            </span>
                        </transition-group>

                        <template v-if="isFirstFloor">
                            <span :class="['text', $style.label, $style._dou]">ДОУ</span>
                            <span :class="['text', $style.label, $style._market]">Супермаркет</span>
                        </template>
                    </div>

                    <svg
                        :class="$style.layer"
                        :viewBox="`0 0 ${floor.width} ${floor.height}`"
                        @click="$emit('reset-buildings', $event)"
                    >
                        <GenplanSvgDefs />

                        <GenplanCommercialHover
                            v-for="hover in hovers"
                            :key="hover.node.id"
                            :hover="hover"
                            :active="hover.active"
                            :active-lot-id="isActiveLotPolygon(hover)"
                            :active-group-building="activeGroupBuilding"
                            @mouseenter="onMouseEnter($event, hover.node)"
                            @click="onHoverClick($event, hover)"
                        />
                    </svg>
                </div>
            </div>
        </div>

        <transition
            name="fade"
            mode="out-in"
        >
            <GenplanCommercialTooltip
                v-if="activeHover.node"
                ref="tooltip"
                :space="activeHover.node"
                :related-spaces="relatedSpaces"
                :mouse="mousePosition"
                :container-data="containerData"
                @mouseleave="onMouseLeaveTooltip"
            />
        </transition>

        <div
            ref="anchor"
            :class="$style.anchor"
        >
        </div>
    </div>
</template>

<script>
import gsap from 'gsap';
import { mapActions, mapGetters } from 'vuex';

import { getOffset } from '@/assets/js/utils';

import GenplanCompass from '@/components/pages/flats/genplan/GenplanCompass';
import GenplanCommercialHover from '@/components/pages/flats/genplan/GenplanCommercialHover';
import GenplanSvgDefs from '@/components/pages/flats/genplan/GenplanSvgDefs';
import GenplanCommercialTooltip from '@/components/pages/flats/genplan/GenplanCommercialTooltip';
import GenplanCommercialIcons from '@/components/pages/flats/genplan/GenplanCommercialIcons';

const GenplanCommercialPopup = () => import('@/components/pages/flats/genplan/GenplanCommercialPopup');

// Дефолтные/не выставленные координаты
const COORD_ZERO = 0;
// Статус - свободно (Коммерческое помещение свободно для покупки)
const STATUS_FREE = 4;
// id первой очереди (этажа)
const FIRST_FLOOR = 1;

export default {
    name: 'GenplanCommercial',

    components: {
        GenplanCompass,
        GenplanCommercialHover,
        GenplanSvgDefs,
        GenplanCommercialTooltip,
        GenplanCommercialIcons,
    },

    props: {
        buildings: {
            type: Array,
            default: () => [],
        },

        floor: {
            type: Object,
            default: () => ({}),
        },

        values: {
            type: Object,
            default: () => ({}),
        },

        lot: {
            type: Object,
            default: () => ({}),
        },

        zoomed: {
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
    },

    data() {
        return {
            animationGenplan: null,

            mousePosition: {
                left: 0,
                top: 0,
            },

            containerData: {
                genplanOffsetX: 0,
                genplanOffsetY: 0,
                genplanHeight: 0,
                genplanWidth: 0,
            },

            anchorObserver: null,
            isBuildingsLowered: false,
            isImgLoaded: false,
            timeoutId: null,
        };
    },

    computed: {
        ...mapGetters('theme', [
            'getThemeName',
        ]),

        ...mapGetters('line-animate', [
            'getActiveBuild',
            'getActiveTooltip',
        ]),

        classes() {
            return [
                {
                    [this.$style['is-zoomed']]: this.zoomed,
                    [this.$style['is-fixed']]: this.values.commercialFixed,
                },
            ];
        },

        isFirstFloor() {
            return this.floor.id === FIRST_FLOOR;
        },

        activeHover() {
            const hover = this.hovers.filter(item => item.node.id === this.getActiveTooltip)[0];
            return hover || {};
        },

        relatedSpaces() {
            if (!this.activeHover.node || !this.activeHover.node.middle_commercial || !this.activeHover.node.middle_commercial.length) {
                return [];
            }

            const middleCommercial = this.activeHover.node.middle_commercial[0];
            const commonCommercialIds = middleCommercial.common_commercial.filter(id => id !== this.activeHover.node.id);

            return this.hovers.filter(item => commonCommercialIds.includes(item.node.id)).map(item => item.node);
        },

        hovers() {
            return this.floor?.commercialproperty_set
                ? this.floor.commercialproperty_set.map(hover => (
                    {
                        node: {
                            ...hover,
                            label_pos: this.getParseLabelPos(hover),
                            icon_pos: this.getParseIconPos(hover),
                            active: this.lot?.id === hover.id,
                        },
                    }
                ))
                : [];
        },

        calcWidthContainer() {
            if (!this.$refs.visual && !window) {
                return;
            }

            return this.$refs.visual.offsetWidth > window.innerWidth;
        },
    },

    mounted() {
        this.$nextTick(() => {
            if (this.$device.isMobile && this.calcWidthContainer) {
                this.getStartAnimationOnce();
            }
        });

        if (this.values.animatedBuildings && this.buildings.length) {
            this.observeAnchor();
            return;
        }

        this.isBuildingsLowered = true;
    },

    beforeDestroy() {
        this.destroyAnchorObserver();

        if (this.animationGenplan) {
            this.animationGenplan.kill();
        }

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    },

    methods: {
        ...mapActions({
            setActiveHoverId: 'line-animate/setActiveHoverId',
            setActiveTooltip: 'line-animate/setActiveTooltip',
            changeVisibility: 'header/changeVisibility',
        }),

        onDrag() {
            if (this.animationGenplan && this.$device.isMobile) {
                this.animationGenplan.pause();

                gsap.to(this.$refs.genplan, {
                    x: 0,
                    duration: 0.3,
                });
            }
        },

        getAnimationGenpalan() {
            if (this.$refs.genplan) {
                this.animationGenplan = gsap.to(this.$refs.genplan, {
                    x: -40,
                    duration: 2,
                    yoyo: true,
                    repeat: -1,
                    ease: 'power2.in',
                });
            }
        },

        getStartAnimationOnce() {
            if (this.isAnimationGenplan) {
                this.getAnimationGenpalan();
            }
        },

        isActiveLotPolygon(hover) {
            if (!this.lot?.id) {
                return false;
            }

            if (this.lot?.id === hover.node.id) {
                return true;
            }

            if (Array.isArray(this.lot?.common_commercial)) {
                return this.lot.common_commercial.includes(hover.node.id);
            }

            if (Array.isArray(this.lot?.middle_common_commercial)) {
                const relatedLotHighIds = this.floor.commercialproperty_set.filter(item => {
                    if (item?.middle_commercial || item?.middle_commercial?.length) {
                        return this.lot.middle_common_commercial.includes(item.middle_commercial[0]?.id);
                    }

                    return false;
                }).map(item => item.id);

                return relatedLotHighIds.includes(hover.node.id);
            }

            return false;
        },

        getLabelClass(hoverNode, isMobile = false) {
            return {
                [this.$style.label]: true,
                [this.$style._isMobile]: isMobile,
                [this.$style._shown]: this.activeGroupBuilding === hoverNode.group || this.getActiveBuild.id === hoverNode.id,
            };
        },

        onEnterHoverBuild(id) {
            this.setActiveHoverId(id);
        },

        onLeaveHoverBuild() {
            this.setActiveHoverId(null);
        },

        isHiddenIcon(hover) {
            return (this.activeGroupBuilding || this.getActiveBuild.id || hover.node.sale_status === STATUS_FREE || !this.isBuildingsLowered) && this.isFirstFloor;
        },

        isShowIcon(hover) {
            return this.isBuildingsLowered && (hover.node.group || hover.node.custom_group);
        },

        observeAnchor() {
            const target = this.$refs.anchor;

            if (!target) {
                return;
            }

            this.anchorObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.getStartBuildingsAnimation();
                        this.anchorObserver.unobserve(target);
                    }
                }, {
                    threshold: 1,
                });
            });

            this.anchorObserver.observe(target);
        },

        destroyAnchorObserver() {
            if (this.anchorObserver) {
                this.anchorObserver.unobserve(this.$refs.anchor);
                this.anchorObserver = null;
            }
        },

        getStartBuildingsAnimation() {
            if (this.$refs.pathAnimate) {
                this.$refs.pathAnimate.forEach(tag => {
                    tag.beginElement();
                });
            }

            setTimeout(() => {
                this.isBuildingsLowered = true;
            }, 1000);
        },

        getParseIconPos(hover) {
            const [x, y] = hover?.tenant_icon_point || [];
            const isCorrect = x !== `${COORD_ZERO}` && y !== `${COORD_ZERO}`;

            if (isCorrect) {
                return {
                    left: `${x}%`,
                    top: `${y}%`,
                };
            }
        },

        getParseLabelPos(hover) {
            if (hover?.tenant_point && hover?.tenant_description_point.length === 2) {
                const [deskX, deskY] = hover.tenant_point.split(',').map(n => Number(n));
                const [mobileX, mobileY] = hover.tenant_description_point;
                return {
                    left: `${!this.$device.isMobile ? deskX : mobileX}%`,
                    top: `${!this.$device.isMobile ? deskY : mobileY}%`,
                    transform: `matrix(0.85, 0.56, -0.8, 0.46, 0, 0)${hover.turn_angle ? ' rotate(' + hover.turn_angle + 'deg' : ''}`,

                };
            }

            return {
                top: 0,
                left: 0,
                display: 'none',
            };
        },

        onMouseEnter(e, hover) {
            if (!this.$device.isDesktop) {
                return false;
            }

            if (this.$refs.visual && hover.sale_status === STATUS_FREE) {
                this.getUpdateContainerData();
            }

            this.$emit('onMouseEnter');
        },

        onMouseLeaveTooltip() {
            if (!this.$device.isDesktop) {
                return false;
            }
            this.setActiveTooltip(null);
            this.$emit('onMouseLeave');
        },

        async onHoverClick(e, hover) {
            if (hover.node?.id && hover?.node?.sale_status === STATUS_FREE) {
                this.setActiveTooltip(hover.node.id);

                if (this.$device.isDesktop) {
                    this.mousePosition = { top: e.pageY, left: e.pageX };
                } else {
                    const props = {
                        data: hover.node,
                        relatedSpaces: this.relatedSpaces,
                        floor: this.floor,
                    };

                    this.timeoutId = this.timeoutId
                        ? clearTimeout(this.timeoutId)
                        : setTimeout(() => {
                            this.changeVisibility(false);
                            this.timeoutId = null;
                        }, 10);

                    this.$panel.open(GenplanCommercialPopup, props, { hideBtnClose: true });
                }
            } else {
                this.$emit('click-hover', hover);
            }
        },

        onClickIcon(group) {
            this.$emit('click-icon', { nameEng: group, icon: true });
        },

        getUpdateContainerData() {
            const { left: genplanOffsetX, top: genplanOffsetY } = getOffset(this.$refs.visual);

            this.containerData = {
                genplanOffsetX: genplanOffsetX,
                genplanOffsetY: genplanOffsetY,
                genplanHeight: this.$refs.visual.getBoundingClientRect().height,
                genplanWidth: this.$refs.visual.getBoundingClientRect().width,
            };
        },

        handleImgLoad() {
            this.isImgLoaded = true;
        },
    },
};
</script>

<style lang="scss" module>
    .GenplanCommercial {
        position: absolute;
        top: -10rem;
        left: 0;
        width: 100%;
        height: 120%;
        scrollbar-width: none;

        @include respond-to(sm) {
            overflow-x: scroll;
            overflow-y: hidden;
        }

        &::-webkit-scrollbar {
            display: none;
        }

        &.is-zoomed {
            .main {
                position: relative;

                @include respond-to(sm) {
                    width: 100%;
                }

                @include respond-to(xs) {
                    width: 780px;
                }
            }

            .bg {
                right: auto;
                width: 174rem;
                min-width: auto;
                max-width: 1740px;
                height: 100%;
                background-position: left center;
                background-size: cover;
            }

            .wrap {
                position: absolute;
                top: -50px;
                left: 50%;
                width: 140rem;
                transform: translateX(-50%);

                @include respond-to(sm) {
                    width: 1000px;
                    margin-left: 0;
                }
            }

            .label {
                font-size: 1.2rem;
            }

            :global(.genplan__box--commercial) {
                width: 126rem;
                min-width: auto;
                max-width: 1260px;

                @include respond-to(sm) {
                    width: 100%;
                    min-width: auto;
                    max-width: none;
                }
            }
        }

        &.is-fixed {
            position: fixed;
            top: -7.2rem;
            left: 2.8rem;
            overflow: visible;
            width: 128rem;
            height: 100%;

            @include respond-to(sm) {
                position: absolute;
                top: -23rem;
                right: 0;
                bottom: auto;
                left: 0;
                overflow-x: scroll;
                overflow-y: hidden;
                width: auto;
                height: auto;

                .main {
                    height: 580px;
                }
            }

            @include respond-to(xs) {
                top: -15rem;
            }
        }
    }

    .main {
        height: 100%;

        @include respond-to(xs) {
            overflow: hidden;
            width: 67rem;
        }
    }

    .wrap {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        width: 100%;
        height: 100%;
        transform-origin: 0 0 0;

        @include respond-to(xs) {
            width: 800px;
            margin-left: -50px;
        }
    }

    .bg {
        position: absolute;
        top: auto;
        right: 0;
        width: 108rem;
        min-width: 1080px;
        height: 100%;
        min-height: 1200px;
        background-position: center;
        background-repeat: no-repeat;
        background-size: contain;

        &._twoLine {
            width: 100rem;
        }

        @include respond-to(xs) {
            display: none;
        }
    }

    .genplan {
        opacity: 0;
        transition: opacity .3s ease-in-out;

        &._loaded {
            opacity: 1;
        }
    }

    .image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-position: center;
        background-repeat: no-repeat;
        background-size: contain;
        transition: filter $theme-transition, opacity .3s ease-in-out;
    }

    .layer {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
        width: 100%;
        height: 100%;
    }

    .path {
        stroke-linejoin: round;
        stroke: #c3c3c3;
        fill: $main-white;
        transition: stroke $theme-transition, fill $theme-transition;
    }

    .labels {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 5;
        width: 100%;
        height: 100%;
        pointer-events: none;

        :global(.commercial-icon) {
            width: 3.2rem;
            height: 3.2rem;
        }
    }

    .label {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 0;
        text-align: center;
        white-space: nowrap;
        font-size: 1.2rem;
        letter-spacing: .05em;
        opacity: 0;
        transform: matrix(.85, .56, -.8, .46, 0, 0);
        transition: opacity $theme-transition;

        @include respond-to(md) {
            font-size: 12px;
        }

        &._isMobile {
            flex-wrap: wrap;
        }

        &._shown {
            opacity: 1;
            transition-delay: .6s;
        }

        &._dou {
            top: 33%;
            left: 46.5%;
            opacity: 1;
        }

        &._market {
            top: 55%;
            left: 78.5%;
            opacity: 1;
        }

        .subLabel {
            color: rgba($dark-main, .32);
        }
    }

    .icon {
        position: absolute;
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 3.2rem;
        height: 3.2rem;
        text-align: center;
        opacity: 1;
        cursor: pointer;

        &._hidden {
            opacity: 0;
            pointer-events: none;
        }

        &._isSecondFloor {
            width: 2.5rem;
            height: 2.5rem;

            svg {
                width: 1.2rem;
                height: 1.2rem;
            }
        }
    }

    .anchor {
        position: absolute;
        right: 0;
        bottom: 12rem;
    }

    .compass {
        position: absolute;
        top: 7%;
        left: 20%;

        @include respond-to(md) {
            top: 7%;
            left: 18%;
        }

        @include respond-to(sm) {
            left: 0;
        }

        @include respond-to(xs) {
            top: 130px;
            left: 90px;
        }
    }

    .hoversWrap {
        opacity: 0;
        transition: opacity .3s ease-in-out;

        &._visible {
            opacity: 1;
        }
    }

    ._absolute {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
</style>

