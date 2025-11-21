<template>
    <g
        :id="hover.id"
        :class="[$style.GenplanCommercialHover, classes]"
    >
        <g
            :class="[$style.activeBuilding, {[$style._shown]: isActiveBuilding}]"
            class="cursor-pointer"
            @mouseleave="$emit('mouseleave', $event)"
            @mouseenter="$emit('mouseenter', $event)"
            @mousemove="$emit('mousemove', $event)"
            @click="$emit('click', $event)"
            @dblclick="$emit('dblclick', $event)"
            v-html="correctPolygon"
        />

        <g :class="$style.line">
            <path
                :ref="`pathLine-${hover.node.group}-${hover.node.id}`"
                :d="correctLine.pathD"
                :class="$style.pathLine"
                stroke-width="1.5"
                :stroke-dasharray="correctLine.totalLength"
                :stroke-dashoffset="correctLine.totalLength"
                fill="none"
            />
        </g>
        <template v-if="entrancePoints">
            <ellipse
                :class="[$style.point, {[$style._shown]: isActiveBuilding}]"
                :cx="entrancePoints.x"
                :cy="entrancePoints.y"
                rx="4.5"
                ry="3"
                stroke="none"
            />
        </template>
    </g>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

// Статус - свободно (Коммерческое помещение свободно для покупки)
const STATUS_FREE = 4;

export default {
    name: 'GenplanCommercialHover',

    props: {
        hover: {
            type: Object,
            required: true,
            default: () => ({}),
        },

        active: {
            type: Boolean,
            default: false,
        },

        activeGroupBuilding: {
            type: String,
            default: '',
        },

        activeLotId: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            isDrawingGroup: false,
            isDrawingId: false,
        };
    },

    computed: {
        ...mapGetters('line-animate', [
            'getAnimationData',
            'getActiveNameGroup',
            'getPrevNameGroup',
            'getActiveBuild',
            'getPrevBuild',
            'getActiveHoverId',
        ]),

        classes() {
            return {
                [this.$style['is-free']]: this.hover?.node?.sale_status === STATUS_FREE && !this.active,
                [this.$style['is-active']]: this.activeLotId,
                [this.$style['_hoverable']]: this.getActiveHoverId === this.hover.node.id,
            };
        },

        isActiveBuilding() {
            return this.activeGroupBuilding === this.hover?.node?.group || this.getActiveBuild.id === this.hover?.node?.id;
        },

        correctPolygon() {
            if (!this.hover?.node?.floor_hover) {
                return '';
            }

            if (this.hover?.node?.floor_hover?.indexOf('<p') !== -1) {
                return this.hover.node.floor_hover;
            } else {
                return `<polygon points="${this.hover.node.floor_hover}"></polygon>`;
            }
        },

        correctLine() {
            if (!this.hover?.node?.tenant_line) {
                return {};
            }

            if (this.isMultiLine(this.hover?.node?.tenant_line)) {
                const lines = this.parseLines(this.hover?.node?.tenant_line);
                const { pathD, totalLength } = this.convertLinesToPath(lines);
                return { pathD, totalLength };
            } else {
                return {};
            }
        },

        entrancePoints() {
            if (this.correctLine && this.correctLine.pathD) {
                const coords = this.correctLine.pathD?.match(/[a-zA-Z]+|[\d.]+/g);

                // Берём последние два числа как координаты конечной точки
                const endIndex = coords.length - 2;
                const x = parseFloat(coords[endIndex]);
                const y = parseFloat(coords[endIndex + 1]);

                return { x, y };
            }

            return null;
        },
    },

    watch: {
        getPrevNameGroup(prevNameGroup) {
            const [prevAnimateLine] = this.findAllRefsByGroup(prevNameGroup);
            if (prevNameGroup && prevAnimateLine) {
                window.requestAnimationFrame(() => {
                    prevAnimateLine.style.strokeDashoffset = prevAnimateLine.getTotalLength();
                });
            }
        },

        getPrevBuild(prevBuild) {
            const animateLine = this.$refs[`pathLine-${prevBuild.group}-${prevBuild.id}`];
            if (animateLine && this.activeGroupBuilding !== prevBuild.group) {
                window.requestAnimationFrame(() => {
                    animateLine.style.strokeDashoffset = animateLine.getTotalLength();
                });
            }
        },

        getAnimationData(data) {
            this.startAnimation(data);
        },
    },

    methods: {
        ...mapActions({
            setActiveBuild: 'line-animate/setActiveBuild',
            setActiveNameGroup: 'line-animate/setActiveNameGroup',
            setPrevBuild: 'line-animate/setPrevBuild',
        }),

        // Проверяем, содержит ли строка несколько линий
        isMultiLine(text) {
            return text.indexOf('<l') !== -1;
        },

        // Разбиваем строку на массив строк-линий
        parseLines(text) {
            const lineSplitRegex = />(?:\s*)<line/;
            return text.split(lineSplitRegex).map(line => line.trim());
        },

        // Извлекаем координаты из строки линии
        extractCoordinates(line) {
            const matches = line.match(/x1="([^"]+)" y1="([^"]+)"\s*x2="([^"]+)" y2="([^"]+)"/);
            return matches ? matches.slice(1).map(Number) : [];
        },

        // Преобразуем массив строк линий в один путь (path) и рассчитывает общую длину
        convertLinesToPath(lines) {
            let pathD = '';
            let totalLength = 0;
            let currentX; let currentY;

            lines.forEach((line, index) => {
                const [x1, y1, x2, y2] = this.extractCoordinates(line);

                if (!index) {
                    pathD += `M${x1},${y1} `;
                } else if (x1 !== currentX || y1 !== currentY) {
                    pathD += `M${x1},${y1} `;
                }

                pathD += `L${x2},${y2} `;

                currentX = x2;
                currentY = y2;

                const segmentLength = this.getPathLength(x1, y1, x2, y2);
                totalLength += segmentLength;
            });

            return { pathD: pathD.trim(), totalLength };
        },

        findAllRefsByGroup(groupName) {
            const regex = new RegExp(`^pathLine-${groupName}-.+$`);
            return Object.keys(this.$refs)
                .filter(ref => regex.test(ref))
                .map(ref => this.$refs[ref]);
        },

        updatePrevBuild(data) {
            const { id, group } = data;
            this.setPrevBuild({ id, group });
        },

        updateActiveBuildings(data) {
            const { id, group } = data;
            this.setActiveBuild({ id, group });
            this.setActiveNameGroup('');
        },

        lineAnimation(line) {
            line.style.strokeDashoffset = 0;
        },

        setAnimationOffset(animateLine, offset) {
            animateLine.style.strokeDashoffset = offset;
        },

        initializeAnimation(animateLine, compareValue, isActive) {
            const totalLength = animateLine.getTotalLength();

            this.lineAnimation(animateLine);

            if (compareValue && isActive) {
                this.setAnimationOffset(animateLine, totalLength);
            }
        },

        animationBuildGroup(data) {
            if (!data?.nameEng) {
                return;
            }

            const animateLine = this.findAllRefsByGroup(data.nameEng)[0];

            if (!animateLine) {
                return;
            }

            this.initializeAnimation(animateLine, data.nameEng !== this.getActiveNameGroup, this.isDrawingGroup);

            if (data.nameEng !== this.getActiveNameGroup && this.getActiveNameGroup) {
                this.isDrawingGroup = false;
            }

            this.isDrawingGroup = !this.isDrawingGroup;
        },

        animationBuild(data) {
            const { node } = data;
            if (!node || !node?.id || !node?.group) {
                return;
            }

            const animateLine = this.$refs[`pathLine-${node.group}-${node.id}`];

            if (!animateLine) {
                return;
            }

            this.initializeAnimation(animateLine, node.id === this.getActiveBuild.id, this.isDrawingId);

            if (node.id !== this.getActiveBuild.id && this.getActiveBuild.group) {
                this.updatePrevBuild(this.getActiveBuild);
                this.isDrawingId = false;
            }

            this.isDrawingId = !this.isDrawingId;
            this.updateActiveBuildings(node);
        },

        startAnimation(data) {
            this.animationBuildGroup(data);

            if (data?.node) {
                this.animationBuild(data);
            }
        },

        getPathLength(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        },
    },
};
</script>

<style lang="scss" module>
    .GenplanCommercialHover {
        stroke-width: 1.5;
        stroke-linejoin: round;
        pointer-events: none;
        transition: fill $theme-transition, stroke $theme-transition;

        :global(.theme-dark) & {
            stroke: #434347;
            fill: $dark-main;

            .line {
                stroke: #323235;
            }
        }

        :global(.theme-light) & {
            stroke: #c3c3c3;
            fill: $main-white;

            .line {
                stroke: #cececd;
            }
        }

        &.is-free {
            pointer-events: auto;

            &._hoverable {
                .activeBuilding {
                    fill: $niagara;
                }
            }

            .activeBuilding {
                &:not(._shown) {
                    transition-delay: 0s;
                }

                &._shown {
                    fill: $niagara;
                }

                @include hover {
                    &:hover {
                        fill: $niagara;
                    }
                }
            }

            :global(.theme-dark) & {
                stroke: #5d5e5f;
                fill: #404143;
            }

            :global(.theme-light) & {
                stroke: #cececd;
                fill: #e1e7ea;
            }

            &.is-active {
                fill: $niagara;
            }
        }

        &.is-busy {
            pointer-events: auto;
            cursor: pointer;

            .activeBuilding {
                &:not(._shown) {
                    transition-delay: 0s;
                }

                @include hover {
                    &:hover {
                        fill: rgba(#cececd, .2);
                    }
                }
            }
        }
    }

    .activeBuilding {
        transition: fill $theme-transition;

        &._shown {
            fill: #cececd;
        }

        &:not(._shown) {
            transition-delay: .6s;
        }
    }

    .pathLine {
        transition: stroke-dashoffset 1s;
    }

    .point {
        opacity: 0;
        stroke: none;
        transition: fill $theme-transition, opacity $theme-transition;

        :global(.theme-dark) & {
            fill: #323235;
        }

        :global(.theme-light) & {
            fill: #cececd;
        }

        &._shown {
            opacity: 1;
            transition-delay: .6s;
        }
    }
</style>

