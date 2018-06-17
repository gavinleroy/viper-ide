import { SymbExLogEntry } from "../ViperProtocol";
import { DebuggerError } from "../Errors";
import { Statement } from "./Statement";
import { Logger } from "../logger";

type VerifiableType = 'Method' | 'Predicate' | 'Function';


/** Represents one of the top-level constructs that can be verified */
export class Verifiable {

    public readonly type: VerifiableType;
    public readonly name: string;
    public readonly statements: Statement[];

    protected constructor(type: VerifiableType, name: string, statements: Statement[] = []) {
        this.type = type;
        this.name = name;
        this.statements = statements;
    }

    public static from(entry: SymbExLogEntry): Verifiable {
        if (!entry.kind) {
            throw new DebuggerError(`SymbExLogEntry has no kind: ${entry.value} @ ${entry.pos}`);
        }

        // TODO: Some proper checks here for which verifiables are allowed not to have children
        if (!entry.children) {
            Logger.error(`SymbExLogEntry has no children: ${entry.value} @ ${entry.pos}`);
            entry.children = [];
            // throw new DebuggerError(`SymbExLogEntry has no children: ${entry.value} @ ${entry.pos}`);
        }

        const kind = entry.kind.toLowerCase();
        const name = entry.value;
        let previous: Statement;
        const statements = entry.children.reduce((acc, child) => {
                const statement = Statement.from(child, undefined, previous);

                // Statement might be null if it does not need to be visualized, only keep those we care about
                if (statement) {
                    if (previous) {
                        previous.next = statement;
                    }
                    previous = statement;

                    acc.push(statement);
                }

                return acc;
        }, <Statement[]>[]);

        if (kind === 'method') {
            return new Verifiable('Method', name, statements);
        } else if (kind === 'predicate') {
            return new Verifiable('Predicate', name, statements);
        } else if (kind === 'function') {
            return new Verifiable('Function', name, statements);
        } else {
            throw new DebuggerError(`Unexpected SymbExLogEntry kind '${entry.kind}'`);
        }
    }
}