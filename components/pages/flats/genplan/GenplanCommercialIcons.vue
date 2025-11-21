<template>
    <component :is="iconComponent"/>
</template>

<script>
const iconMap = {
    health: 'IconHeart',
    cafe: 'IconCafe',
    cloth: 'IconClothes',
    shop: 'IconGroceries',
    beauty: 'IconScissors',
    education: 'IconEducation',
    furniture: 'IconFurniture',
    zoo: 'IconZoo',
    'Кафе и рестораны': 'IconCafe',
    'Магазин/услуги': 'IconGroceries',
    Помещение: 'IconClothes',
};

export default {
    name: 'GenplanCommercialIcons',

    props: {
        name: {
            type: String,
            default: '',
        },
    },

    computed: {
        iconComponent() {
            const iconName = iconMap[this.name];

            if (!iconName) {
                return;
            }

            return () => import(`@/components/icons/${iconName}`);
        },
    },
};
</script>

