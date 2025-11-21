<template>
    <div :class="$style.CommercialPlan">
        <span
            id="commercial-select"
            :class="$style.anchor"
        />

        <div :class="['container', $style.container]">
            <div
                :class="['h5', 'subtitle', $style.subtitle]"
                v-html="strTitle"
            />

            <VTabList
                :class="$style.tabs"
                :tabs="compTabs"
                :value="currentTab"
                view="button"
                @click="changeCurrentTab"
            />

            <transition
                name="fade"
                mode="out-in"
            >
                <div
                    :key="currentTab"
                    :class="$style.content"
                >
                    <GenplanCommercialBuildings
                        :key="`mobile-is-${isMobileOrTablet}`"
                        :class="$style.buildingsBlock"
                        :buildings="groupBuildings"
                        :floor-number="currentTab"
                        @click="onClickGroupBuildings"
                        @mouseenter="handleEnterHoverBuild"
                        @mouseleave="handleLeaveHoverBuild"
                    />

                    <Genplan
                        :class="$style.genplan"
                        :floor="compContent"
                        :buildings="select.commercialbuilding_set"
                        :values="genplanValues[currentTab]"
                        :active-group-building="selectedGroupBuildings"
                        :is-animation-genplan="isAnimationGenplan && !lot"
                        :flat="lot"
                        commercial
                        @click-hover="handleSelectLot"
                        @click-icon="onClickGroupBuildings"
                        @reset-buildings="onResetBuildings"
                    />
                </div>
            </transition>

            <BottomToolbar
                :class="$style.bottom"
                mobile-labels-visible
                is-commercial-page
            >
                <template #left>
                    <DefaultButton
                        :class="[$style.button, $style.modalButton, 'cursor-pointer']"
                        size="small"
                        @click="onOpenFormModal"
                    >
                        {{ CONSULTATION }}
                    </DefaultButton>
                </template>
                <template #right>
                    <CircleButton
                        :class="$style.btn"
                        size="small"
                        inverted
                        @click="handleZoomGenplan"
                    >
                        <IconZoom />
                    </CircleButton>
                </template>

                <template #rightLabel>
                    <span
                        class="text cursor-pointer"
                        :class="$style.label"
                        @click="handleZoomGenplan"
                        v-html="strZoom"
                    />
                </template>
            </BottomToolbar>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

import CircleButton from '@/components/ui/button/CircleButton';
import IconZoom from '@/components/icons/IconZoom';
import Genplan from '@/components/pages/flats/genplan/Genplan';
import GenplanCommercialBuildings from '@/components/pages/flats/genplan/GenplanCommercialBuildings';
import BottomToolbar from '@/components/common/BottomToolbar';
import VTabList from '@/components/pages/home/VTabList';
import DefaultButton from '@/components/ui/button/DefaultButton';
const GenplanModal = () => import('@/components/layout/Modals/GenplanModal');
const SelectionModal = () => import('@/components/layout/Modals/commercial/SelectionModal');

const CONSULTATION = 'Получить консультацию';
const groupNames = {
    beauty: 'Красота',
    cafe: 'Кафе и рестораны',
    shop: 'Продукты',
    education: 'Образование',
    health: 'Здоровье',
    furniture: 'Мебель',
    cloth: 'Одежда',
    zoo: 'Животные',
    'Кафе и рестораны': 'Кафе и рестораны',
    'Магазин/услуги': 'Магазин/услуги',
};

// Статус - свободно (Коммерческое помещение свободно для покупки)
const STATUS_FREE = 4;
const TITLE = 'Выберите<br/> коммерческое<br/> помещение';
const ZOOM_IN = 'Увеличить';

export default {
    name: 'CommercialPlan',

    components: {
        CircleButton,
        IconZoom,
        Genplan,
        BottomToolbar,
        GenplanCommercialBuildings,
        VTabList,
        DefaultButton,
    },

    props: {
        floors: {
            type: Array,
            default: () => [],
        },

        select: {
            type: Object,
            default: () => ({}),
        },

        selectedFloor: {
            type: Number,
            default: 1,
        },

        lot: {
            type: Object,
            default: () => ({}),
        },
    },

    data() {
        return {
            selectedGroupBuildings: '',
            selectedOneBuildingId: null,
            isShowGroupBuildings: false,
            isClickIcon: false,
            currentTab: this.selectedFloor ?? 0,
            isAnimationGenplan: true,

            genplanValues: [
                {
                    view: 'commercial',
                    animatedBuildings: !this.$device.isMobile,
                    bg: '/images/commercial/genplan-bg--light.svg',
                    floor: 1,
                },
                {
                    view: 'commercial',
                    animatedBuildings: false,
                    bg: '/images/commercial/genplan-bg2.svg',
                    floor: 2,
                },
            ],

            CONSULTATION,
        };
    },

    computed: {
        ...mapGetters('line-animate', [
            'getAnimationData',
            'getActiveNameGroup',
            'getActiveBuild',
            'getActiveHoverId',
        ]),

        compTabs() {
            return [
                { name: '2 очередь', value: 1 },
                { name: '1 очередь', value: 0 },
            ];
        },

        compContent() {
            return this.floors[this.currentTab];
        },

        groupBuildings() {
            if (!this.compContent.commercialproperty_set) {
                return;
            }

            const buildings = this.compContent.commercialproperty_set;

            let groupedBuildings = [];

            if (this.currentTab && this.isMobileOrTablet) {
                groupedBuildings = buildings.map(build => ({
                    name: `${build.custom_group ? build.custom_group : 'Помещение'} №${build.number}, ${build.area}м²`,
                    id: build.id,
                    nameEng: build.custom_group ? build.custom_group : 'Помещение',
                }));
            } else {
                const groupMap = this.buildGroupMap(buildings);
                groupedBuildings = this.transformGroupMapToArray(groupMap);
            }

            return groupedBuildings;
        },

        isMobileOrTablet() {
            return this.$device.isMobileOrTablet;
        },

        strTitle() {
            return TITLE;
        },

        strZoom() {
            return this.$device.isMobile ? ZOOM_IN : `${ZOOM_IN} схему`;
        },
    },

    watch: {
        getActiveNameGroup() {
            this.selectedGroupBuildings = this.getActiveNameGroup;
        },
    },

    methods: {
        ...mapActions({
            setAnimationData: 'line-animate/setAnimationData',
            setPrevNameGroup: 'line-animate/setPrevNameGroup',
            setActiveBuild: 'line-animate/setActiveBuild',
            setActiveNameGroup: 'line-animate/setActiveNameGroup',
            setPrevBuild: 'line-animate/setPrevBuild',
            setActiveHoverId: 'line-animate/setActiveHoverId',
            setActiveTooltip: 'line-animate/setActiveTooltip',
        }),

        // создания мапы групп зданий
        buildGroupMap(buildings) {
            return buildings.reduce((acc, building) => {
                const groupName = groupNames[building.group] || groupNames[building.custom_group];

                if (!groupName) {
                    return acc;
                }

                const groupKey = building.group || groupNames[building.custom_group];

                // Если группа ещё не создана в аккумуляторе, инициализируем её.
                if (!acc[groupKey]) {
                    acc[groupKey] = {
                        name: groupName,
                        arrayBuildings: [],
                    };
                }

                // Добавляем текущее здание в список зданий его группы.
                acc[groupKey].arrayBuildings.push(building);

                return acc;
            }, {});
        },

        // преобразования мапы групп в массив объектов
        transformGroupMapToArray(groupMap) {
            return Object.entries(groupMap).map(([groupKey, { name, arrayBuildings }]) => ({
                name,
                nameEng: groupKey,
                arrayBuildings,
            }));
        },

        handleZoomGenplan() {
            this.$modal.open(GenplanModal, {
                genplanProps: {
                    floor: this.compContent,
                    buildings: this.select.commercialbuilding_set,
                    values: {
                        ...this.genplanValues[this.currentTab],
                        animatedBuildings: false,
                    },
                    zoomed: true,
                    commercial: true,
                },
                desc: 'Увеличенная схема этажа',
                clickHoverHandler: this.handleSelectLot,
                clickIconHandler: this.onClickGroupBuildings,
                isScheme: true,
            });
        },

        handleEnterHoverBuild(id) {
            this.setActiveHoverId(id);
        },

        handleLeaveHoverBuild() {
            this.setActiveHoverId(null);
        },

        changeCurrentTab(id) {
            this.currentTab = id;

            this.isAnimationGenplan = false;

            this.resetActiveBuilding();
            this.resetActiveGroup();
        },

        startLinesAnimation(data) {
            this.setAnimationData(data);
        },

        handleSelectLot(hover) {
            if (hover?.node?.sale_status !== STATUS_FREE) {
                this.startLinesAnimation(hover);

                // Определяет, одно ли это и то же здание.
                const isSameBuild = !this.selectedGroupBuildings && this.selectedOneBuildingId !== hover.node?.id;
                const newActiveBuild = isSameBuild ? { id: hover.node?.id, group: hover.node?.group } : { id: null, group: '' };

                // Устанавливает активное здание в store и обновляем выбранные данные.
                this.setActiveBuild(newActiveBuild);
                this.selectedOneBuildingId = isSameBuild ? hover.node?.id : null;
                this.selectedGroupBuildings = '';
            }
        },

        toggleGroupBuildingsVisibility(data) {
            // Если иконка не была кликнута (не показана группа зданий через клик по иконке), показываем группу зданий
            this.isShowGroupBuildings = !this.isClickIcon || this.selectedGroupBuildings !== data.nameEng;
            // Если имя текущей группы совпадает с выбранной, переключаем видимость
            if (data.nameEng === this.selectedGroupBuildings) {
                this.isShowGroupBuildings = !this.isShowGroupBuildings;
            }

            // Обновляем выбранную группу зданий
            this.selectedGroupBuildings = this.isShowGroupBuildings ? data.nameEng : '';
        },

        updateActiveGroupData(data) {
            // Сохраняем данные о предыдущих группах зданий
            if (data.nameEng !== this.getActiveNameGroup) {
                this.setPrevNameGroup(this.getActiveNameGroup);
            }

            // Сохраняем данные о предыдущих зданиях
            if (this.getActiveBuild.id && this.getActiveBuild.group) {
                const { id, group } = this.getActiveBuild;

                if (id && group) {
                    this.setPrevBuild({ id, group });
                }
            }

            this.setActiveNameGroup(data.nameEng);
            this.setActiveBuild({ id: null, group: '' });
            this.selectedOneBuildingId = null;
        },

        onClickGroupBuildings(data) {
            if (this.currentTab) {
                return;
            }

            if (data.nameEng === this.getActiveNameGroup && !this.isClickIcon) {
                this.resetActiveBuilding();
                this.resetActiveGroup();
                return;
            }

            // Переключение видимости группы зданий
            this.toggleGroupBuildingsVisibility(data);

            // Определяем была ли показана группа зданий кликом по иконке и кликаем ли мы по той же группе
            const isClickedIconAndSameGroup = this.isClickIcon && data.nameEng === this.getActiveNameGroup;

            // Обновление данных об активных группах и зданиях
            this.updateActiveGroupData(data);

            // Определяем отрисовываем анимацию или нет
            this.startLinesAnimation(!isClickedIconAndSameGroup ? data : null);

            this.isClickIcon = Boolean(data.icon);
        },

        resetActiveBuilding() {
            if (this.getActiveBuild.id && this.getActiveBuild.group) {
                const { id, group } = this.getActiveBuild;

                if (id && group) {
                    this.setPrevBuild({ id, group });
                }

                this.setActiveBuild({ id: null, group: '' });
                this.selectedOneBuildingId = null;
            }
        },

        resetActiveGroup() {
            if (this.getActiveNameGroup) {
                this.startLinesAnimation({ nameEng: this.getActiveNameGroup });

                this.setPrevNameGroup(this.getActiveNameGroup);
                this.setActiveNameGroup('');

                this.selectedGroupBuildings = '';
                this.isShowGroupBuildings = false;
            }
        },

        onResetBuildings(e) {
            if (e.target.tagName !== 'svg') {
                return;
            }

            this.resetActiveBuilding(); // Сброс активного здания
            this.resetActiveGroup(); // Сброс активной группы зданий
            this.setActiveTooltip(null); // Закрытие тултипа
        },

        onOpenFormModal() {
            this.$modal.open(SelectionModal);
        },
    },
};
</script>

<style lang="scss" module>
    .CommercialPlan {
        position: relative;
        overflow: hidden;
        height: 100vh;
        min-height: 800px;
        transition: background-color $theme-transition;

        @include respond-to(xs) {
            height: 103vh;
        }

        :global(.theme-dark) & {
            background-color: #08090c;
        }

        :global(.theme-light) & {
            background-color: #eeecea;
        }
    }

    .anchor {
        position: absolute;
        top: 0;
        left: 0;
    }

    .container {
        position: relative;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        padding-top: 3.2rem;
        padding-bottom: 6.4rem;

        @include respond-to(xs) {
            padding-top: 24px;
            padding-bottom: 32px;
        }
    }

    .content {
        position: relative;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;

        @include respond-to(xs) {
            width: calc(100% + 2 * $side-padding-mobile);
            margin-left: -$side-padding-mobile;
        }
    }

    .subtitle {
        width: 22rem;
        line-height: 1.1;
    }

    .link {
        position: relative;
        z-index: 3;
        align-self: flex-start;
        margin-top: 4rem;

        @include respond-to(xs) {
            margin-top: 16px;
        }
    }

    .tabs {
        z-index: 3;
        margin-top: 2.4rem;
    }

    .text {
        position: absolute;
        top: 4rem;
        right: $side-padding;
        width: 28.4rem;

        @include respond-to(xs) {
            display: none;
        }
    }

    .bottom {
        position: absolute;
        bottom: 1.8rem;
        z-index: 2;
        width: calc(100% - #{$side-padding * 2});

        @include respond-to(xs) {
            bottom: 1rem;
            width: calc(100% - #{$side-padding-mobile * 2});
        }
    }

    .label {
        @include respond-to(xs) {
            font-size: 12px;
        }
    }

    .buildingsBlock {
        position: relative;
        z-index: 3;
        width: max-content;
        margin-top: 3rem;

        @include respond-to(sm) {
            position: absolute;
            bottom: 4rem;
            overflow-x: scroll;
            width: 100%;
            margin: 0;
            padding-left: $side-padding-mobile;
        }
    }

    .modalButton {
        @include respond-to(xs) {
            display: none;
        }
    }
</style>

