export const state = () => ({
    animationData: null,
    activeNameGroup: null,
    prevNameGroup: null,
    activeBuild: { id: null, group: '' },
    prevBuild: { id: null, group: '' },
    activeHoverId: null,
    activeTooltip: null,
});

export const getters = {
    getActiveNameGroup(state) {
        return state.activeNameGroup;
    },

    getPrevNameGroup(state) {
        return state.prevNameGroup;
    },

    getActiveBuild(state) {
        return state.activeBuild;
    },

    getPrevBuild(state) {
        return state.prevBuild;
    },

    getAnimationData(state) {
        return state.animationData;
    },

    getActiveHoverId(state) {
        return state.activeHoverId;
    },

    getActiveTooltip(state) {
        return state.activeTooltip;
    },
};

export const actions = {
    setActiveNameGroup({ commit }, values) {
        commit('SET_ACTIVE_NAME_GROUP', values);
    },

    setPrevNameGroup({ commit }, values) {
        commit('SET_PREV_NAME_GROUP', values);
    },

    setActiveBuild({ commit }, values) {
        commit('SET_ACTIVE_BUILD', values);
    },

    setPrevBuild({ commit }, values) {
        commit('SET_PREV_BUILD', values);
    },

    setAnimationData({ commit }, data) {
        commit('SET_ANIMATION_DATA', data);
    },

    setActiveHoverId({ commit }, values) {
        commit('SET_ACTIVE_HOVER_ID', values);
    },

    setActiveTooltip({ commit }, values) {
        commit('SET_ACTIVE_TOOLTIP', values);
    },
};

export const mutations = {
    SET_ACTIVE_NAME_GROUP(state, payload) {
        state.activeNameGroup = payload;
    },

    SET_PREV_NAME_GROUP(state, payload) {
        state.prevNameGroup = payload;
    },

    SET_ACTIVE_BUILD(state, payload) {
        state.activeBuild = payload;
    },

    SET_PREV_BUILD(state, payload) {
        state.prevBuild = payload;
    },

    SET_ANIMATION_DATA(state, payload) {
        state.animationData = payload;
    },

    SET_ACTIVE_HOVER_ID(state, payload) {
        state.activeHoverId = payload;
    },

    SET_ACTIVE_TOOLTIP(state, payload) {
        state.activeTooltip = payload;
    },
};

