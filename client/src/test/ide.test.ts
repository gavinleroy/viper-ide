import * as assert from 'assert';
import * as path from 'path';
import { Helper } from '../Helper';
import TestHelper, { EMPTY_TXT, LONG, SETUP_TIMEOUT, SIMPLE } from './TestHelper';

suite('ViperIDE Tests', () => {

    suiteSetup(async function() {
        this.timeout(SETUP_TIMEOUT);
        await TestHelper.setup();
        // these tests require a running backend:
        await TestHelper.startExtension();
    });

    suiteTeardown(async function() {
        await TestHelper.teardown();
    });
    
    test("Test abort", async function() {
        this.timeout(30000);

        TestHelper.resetErrors();

        await TestHelper.openAndVerify(LONG);
        await TestHelper.verify();
        // stop the verification after 0.3s because it will be fast due to caching
        setTimeout(() => {
            TestHelper.log("timeout triggered: stopping verification");
            TestHelper.stopVerification()
        }, 300);

        await TestHelper.waitForVerificationOrAbort();
        await TestHelper.checkForRunningProcesses(false, true, true);
        await TestHelper.openAndVerify(LONG);
        assert (!TestHelper.hasObservedInternalError());
    });

    test("Test closing files", async function() {
        this.timeout(30000);
        TestHelper.resetErrors();

        TestHelper.openAndVerify(LONG);
        await TestHelper.wait(500);
        await TestHelper.closeFile();
        await TestHelper.openFile(SIMPLE);
        await TestHelper.wait(200);
        await TestHelper.stopVerification();
        await TestHelper.closeFile();
        await TestHelper.openFile(LONG);
        await TestHelper.waitForVerification(LONG);
        assert (!TestHelper.hasObservedInternalError());
    });

    test("Test not verifying verified files", async function() {
        this.timeout(40000);

        await TestHelper.openAndVerify(SIMPLE);
        // simulate context switch by opening non-viper file
        await TestHelper.openFile(EMPTY_TXT);
        const verificationStart = TestHelper.waitForVerificationStart(SIMPLE);
        await TestHelper.openFile(SIMPLE);
        // wait 1000ms for verification start - it should not start
        const timeoutHit = TestHelper.waitForTimeout(1000, verificationStart);
        assert(timeoutHit, "unwanted reverification of verified file after switching context");
    });
    
    test("Test zooming", async function() {
        this.timeout(20000);

        const started = TestHelper.waitForBackendStarted();
        await TestHelper.executeCommand("workbench.action.zoomIn")
        await TestHelper.wait(5000);
        await TestHelper.executeCommand("workbench.action.zoomOut");
        const timeoutHit = await TestHelper.waitForTimeout(9000, started);
        assert(timeoutHit, "backend was restarted, but it should not be");
    });
        
    test("Test autoVerify", async function() {
        this.timeout(2000);

        // disable auto verify:
        await TestHelper.executeCommand("viper.toggleAutoVerify");
        const started = TestHelper.waitForVerificationStart(LONG);
        await TestHelper.openFile(LONG);
        await TestHelper.openFile(SIMPLE);
        const timeoutHit = await TestHelper.waitForTimeout(1000, started);
        assert(timeoutHit, "verification was started even if autoVerify is disabled");
        // turn auto verify back on:
        TestHelper.executeCommand("viper.toggleAutoVerify");
    });

    test("Test Helper Methods", async function() {
        this.timeout(1000);

        await TestHelper.openFile(SIMPLE);

        checkAssert(Helper.formatProgress(12.9), "13%", "formatProgress");
        checkAssert(Helper.formatSeconds(12.99), "13.0 seconds", "formatSeconds");
        checkAssert(Helper.isViperSourceFile("/folder/file.vpr"), true, "isViperSourceFile unix path");
        checkAssert(Helper.isViperSourceFile("..\\.\\folder\\file.sil"), true, "isViperSourceFile relavive windows path");
        checkAssert(!Helper.isViperSourceFile("C:\\absolute\\path\\file.ts"), true, "isViperSourceFile absolute windows path");
        checkAssert(path.basename(Helper.uriToString(Helper.getActiveFileUri())), SIMPLE, "active file");
    });
        
    test("Test opening logFile", async function() {
        this.timeout(2000);

        const opened = TestHelper.waitForLogFile();
        await TestHelper.executeCommand('viper.openLogFile');
        await opened;
        await TestHelper.executeCommand('workbench.action.closeActiveEditor');
        await TestHelper.wait(500);
    });
});

function checkAssert<T>(seen: T, expected: T, message: string) {
    assert(expected === seen, message + ": Expected: " + expected + " Seen: " + seen);
}
