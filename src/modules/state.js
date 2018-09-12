const state = {
    ledStatus: true,
    updater: {
        url: '',
        interval: 0,
        active: false,
        process: 0,
        calls: getDefaultStateCalls(),
    }
};

const defaultCalls = {
    time: 0,
    lastStatus: null,
    totalCount: 0,
    errorCount: 0,
};

const getDefaultStateCalls = function() {
    return {
        time: defaultCalls.time,
        lastStatus: defaultCalls.lastStatus,
        totalCount: defaultCalls.totalCount,
        errorCount: defaultCalls.errorCount, 
    }
};

const getUptime = function () {
    return Date.now() - STATE.startTime;
};

const getStartTime = function () {
    return STATE.startTime;
};

const initTime = function(){
    STATE.startTime = Date.now();
};

module.exports = {
    state,
    getUptime,
    getStartTime,
    initTime
};