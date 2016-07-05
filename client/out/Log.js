'use strict';
const vscode = require("vscode");
const path = require('path');
const fs = require('fs');
const ViperProtocol_1 = require('./ViperProtocol');
class Log {
    static initialize(context) {
        Log.updateSettings();
        Log.logFilePath = path.join(vscode.workspace.rootPath, '.vscode', Log.logFilePath);
        Log.log("LogFilePath is: " + Log.logFilePath, ViperProtocol_1.LogLevel.Debug);
        try {
            fs.closeSync(fs.openSync(Log.logFilePath, 'w'));
            fs.accessSync(Log.logFilePath);
            Log.logFile = fs.createWriteStream(Log.logFilePath);
            //make sure the logFile is closed when the extension is closed
            context.subscriptions.push(new Log());
        }
        catch (e) {
            Log.error("cannot write to LogFile, access denied. " + e);
        }
    }
    static updateSettings() {
        let settings = vscode.workspace.getConfiguration("viperSettings");
        Log.logLevel = settings.get("logLevel", ViperProtocol_1.LogLevel.Default);
        Log.log("logLevel changed to " + Log.logLevel.toString(), ViperProtocol_1.LogLevel.Debug);
    }
    static log(message, logLevel = ViperProtocol_1.LogLevel.Default) {
        let messageNewLine = message + "\n";
        if (Log.logLevel >= logLevel) {
            console.log(message);
            Log.outputChannel.append(messageNewLine);
        }
        if (Log.logFile) {
            Log.logFile.write(messageNewLine);
        }
    }
    static toLogFile(message, logLevel = ViperProtocol_1.LogLevel.Default) {
        if (Log.logLevel >= logLevel && Log.logFile) {
            let messageNewLine = message + "\n";
            Log.logFile.write(messageNewLine);
        }
    }
    static error(message, logLevel = ViperProtocol_1.LogLevel.Debug) {
        let messageNewLine = "ERROR: " + message + "\n";
        if (Log.logLevel >= logLevel && Log.logFile) {
            console.error(message);
            Log.outputChannel.append(messageNewLine);
        }
        if (Log.logFile) {
            Log.logFile.write(messageNewLine);
        }
    }
    dispose() {
        Log.logFile.close();
    }
    static hint(message) {
        Log.log("H: " + message, ViperProtocol_1.LogLevel.Debug);
        vscode.window.showInformationMessage("Viper: " + message);
    }
}
Log.logFilePath = "viper_log";
Log.outputChannel = vscode.window.createOutputChannel('Viper');
exports.Log = Log;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0xvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7QUFFYixNQUFZLE1BQU0sV0FBTSxRQUFRLENBQUMsQ0FBQTtBQUNqQyxNQUFZLElBQUksV0FBTSxNQUFNLENBQUMsQ0FBQTtBQUM3QixNQUFZLEVBQUUsV0FBTSxJQUFJLENBQUMsQ0FBQTtBQUN6QixnQ0FBdUIsaUJBQWlCLENBQUMsQ0FBQTtBQUV6QztJQU9JLE9BQWMsVUFBVSxDQUFDLE9BQWdDO1FBQ3JELEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNyQixHQUFHLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNuRixHQUFHLENBQUMsR0FBRyxDQUFDLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxXQUFXLEVBQUUsd0JBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUM3RCxJQUFJLENBQUM7WUFDRCxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2hELEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQy9CLEdBQUcsQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNwRCw4REFBOEQ7WUFDOUQsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQzFDLENBQUU7UUFBQSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1QsR0FBRyxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsR0FBRyxDQUFDLENB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