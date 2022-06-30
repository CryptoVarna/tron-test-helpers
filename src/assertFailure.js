async function assertFailure(promise) {
    try {
        await promise;
    } catch (error) {
        return error;
    }
    expect.fail("Expected to fail but it didn't");
}

module.exports = assertFailure;
