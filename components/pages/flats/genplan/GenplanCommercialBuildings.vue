<template>
    <div :class="$style.GenplanCommercialBuildings">
        <VAccordion
            :class="$style.accordionBuilding"
            click-out-side
            target-tag="svg"
        >
            <VAccordionItem
                v-for="(item, i) in buildings"
                :key="`accordion-${i}`"
                :class="$style.accordionItem"
            >
                <template #header>
                    <button
                        :class="$style.headerContent"
                        @click="$emit('click', item)"
                    >
                        <div :class="$style.icon" class="commercial-icon">
                            <GenplanCommercialIcons :name="item.nameEng" />
                        </div>

                        <div
                            :class="$style.headerText"
                            v-html="item.name"
                        >
                        </div>
                    </button>
                </template>

                <div
                    v-if="item.arrayBuildings"
                    :class="$style.hiddenBlock"
                >
                    <ul
                        v-if="item.arrayBuildings.length !== 1"
                        :class="$style.subList"
                    >
                        <li
                            v-for="(subitem, index) in item.arrayBuildings"
                            :key="`sub-${index}`"
                            :class="$style.hiddenContent"
                        >
                            <template v-if="subitem.tenant && subitem.description">
                                <span :class="$style.name" v-html="subitem.tenant"/>
                                <span :class="$style.subName" v-html="subitem.description"/>
                            </template>

                            <template v-else>
                                <div
                                    @mouseenter="$emit('mouseenter', subitem.id)"
                                    @mouseleave="$emit('mouseleave', subitem.id)"
                                >
                                    <nuxt-link
                                        :class="[$style.name, $style._link]"
                                        :to="getCurrentLink(`/commercial/${subitem.id}`)"
                                        v-html="getCurrentText(subitem.number, subitem.area)"
                                    />
                                </div>
                            </template>
                        </li>
                    </ul>

                    <div v-else :class="$style.hiddenContent">
                        <template v-if="item.arrayBuildings[0].tenant && item.arrayBuildings[0].description">
                            <span :class="$style.name" v-html="item.arrayBuildings[0].tenant"/>
                            <span :class="$style.subName" v-html="item.arrayBuildings[0].description"/>
                        </template>

                        <template v-else>
                            <div
                                @mouseenter="$emit('mouseenter', item.arrayBuildings[0].id)"
                                @mouseleave="$emit('mouseleave', item.arrayBuildings[0].id)"
                            >
                                <nuxt-link
                                    :class="[$style.name, $style._link]"
                                    :to="getCurrentLink(`/commercial/${item.arrayBuildings[0].id}`)"
                                    v-html="getCurrentText(item.arrayBuildings[0].number, item.arrayBuildings[0].area)"
                                />
                            </div>
                        </template>
                    </div>
                </div>
            </VAccordionItem>
        </VAccordion>

        <ul :class="$style.buttonsGroup">
            <li
                v-for="(item, i) in buildings"
                :key="`button-${i}`"
                :class="$style.buttonItem"
            >
                <button
                    :class="$style.button"
                    @click="onToggle(item)"
                >
                    <div
                        class="commercial-icon"
                        :class="getIconClass(item)"
                    >
                        <GenplanCommercialIcons :name="item.nameEng" />
                    </div>

                    <div :class="$style.headerText" v-html="item.name"/>
                </button>
            </li>
        </ul>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { utmLinkMixin } from '@/assets/js/mixins/utmLinkMixin';

import VAccordion from '@/components/ui/accordion/VAccordion';
import VAccordionItem from '@/components/ui/accordion/VAccordionItem';
import GenplanCommercialIcons from '@/components/pages/flats/genplan/GenplanCommercialIcons';

export default {
    name: 'GenplanCommercialBuildings',

    components: {
        VAccordion,
        VAccordionItem,
        GenplanCommercialIcons,
    },

    mixins: [utmLinkMixin],

    props: {
        buildings: {
            type: Array,
            default: () => [],
        },

        floorNumber: {
            type: Number,
            default: 0,
        },
    },

    data() {
        return {
            activeItem: null,
        };
    },

    computed: {
        ...mapGetters('line-animate', [
            'getActiveNameGroup',
        ]),
    },

    methods: {
        isItemActive(item) {
            return this.activeItem === item.nameEng && this.getActiveNameGroup === item.nameEng;
        },

        getIconClass(item) {
            return {
                [this.$style.icon]: true,
                [this.$style._active]: this.isItemActive(item),
            };
        },

        onToggle(item) {
            if (this.floorNumber) {
                this.$router.push({
                    name: 'commercial-id',
                    params: {
                        id: item.id,
                    },
                });
            } else {
                this.activeItem = !this.isItemActive(item) ? item.nameEng : null;
                this.$emit('click', item);
            }
        },

        getCurrentText(number, area) {
            return `Помещение №${number}, ${area}м²`;
        },
    },
};
</script>

<style lang="scss" module>
    .GenplanCommercialBuildings {
        .accordionBuilding {
            padding-bottom: 3.2rem;
        }

        @include respond-to(sm) {
            .accordionBuilding {
                display: none;
                padding-bottom: 0;
            }
        }
    }

    .accordionBuilding {
        position: relative;
        overflow-x: auto;
        max-height: 40rem;
        scrollbar-width: none;
        -ms-overflow-style: none;

        &::-webkit-scrollbar {
            width: 0;
            height: 0;
        }
    }

    .accordionItem {
        &:not(:first-child) {
            padding-top: 1.6rem;

            @include respond-to(sm) {
                padding-top: 0;
            }
        }
    }

    .buttonsGroup {
        display: none;

        @include respond-to(sm) {
            display: flex;
            padding-bottom: 1.6rem;

            .headerText {
                margin-right: 1.6rem;
            }
        }
    }

    .headerContent,
    .button {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        user-select: none;
        cursor: pointer;

        @include hover {
            &:hover {
                .icon {
                    border-color: rgba($dark-main, .4);
                }
            }
        }
    }

    .icon {
        margin-right: 1.3rem;
        pointer-events: none;
    }

    .headerText,
    .name {
        display: inline-block;
        width: max-content;
        font-size: 1.3rem;
        line-height: 1.5rem;
        letter-spacing: .05em;
        color: $dark-main;
        transition: color $default-transition;
        user-select: none;
        pointer-events: none;

        &._link {
            pointer-events: auto;

            @include hover {
                &:hover {
                    color: rgba($dark-main, .6);
                }
            }
        }
    }

    ._active {
        border: 1px solid $dark-main;
        background-color: $dark-main;
        color: $main-white;
    }

    .hiddenBlock {
        margin-top: 1.6rem;
    }

    .hiddenContent {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        height: 4rem;
        padding-left: 5.2rem;

        &:not(:first-child) {
            margin-top: 1rem;
        }

        &:before {
            content: "";
            position: absolute;
            top: 1.6rem;
            left: 1.6rem;
            width: .8rem;
            height: .8rem;
            border-radius: 50%;
            background-color: rgba($dark-main, .12);
        }
    }

    .subName {
        font-size: 1.2rem;
        line-height: 1.4rem;
        color: rgba($dark-main, .32);
    }
</style>

