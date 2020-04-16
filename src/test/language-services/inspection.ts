// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as PQP from "@microsoft/powerquery-parser";
import { assert, expect } from "chai";
import "mocha";

import { SignatureProviderContext } from "../../language-services";
import { InspectionUtils } from "../../language-services";
import * as Utils from "./utils";
import { Position } from "vscode-languageserver-types";

// tslint:disable: no-unnecessary-type-assertion

function expectScope(inspected: PQP.Task.InspectionOk, expected: string[]): void {
    expect(inspected.scope).to.have.keys(expected);
}

// Unit testing for analysis operations related to power query parser inspection results.
describe("InspectedInvokeExpression", () => {
    describe("getContextForInspected", () => {
        it("Date.AddDays(d|,", () => {
            const [document, position]: [Utils.MockDocument, Position] = Utils.documentAndPositionFrom(
                "Date.AddDays(d|,",
            );
            const inspected: PQP.Task.InspectionOk = Utils.expectInspectionOk(document, position);
            const maybeContext: SignatureProviderContext | undefined = InspectionUtils.maybeSignatureProviderContext(
                inspected,
            );
            assert.isDefined(maybeContext);
            const context: SignatureProviderContext = maybeContext!;

            expect(context.maybeFunctionName).to.equal("Date.AddDays");
            expect(context.maybeArgumentOrdinal).to.equal(0);
        });

        it("Date.AddDays(d,|", () => {
            const [document, position]: [Utils.MockDocument, Position] = Utils.documentAndPositionFrom(
                "Date.AddDays(d,|",
            );
            const inspected: PQP.Task.InspectionOk = Utils.expectInspectionOk(document, position);
            const maybeContext: SignatureProviderContext | undefined = InspectionUtils.maybeSignatureProviderContext(
                inspected,
            );
            assert.isDefined(maybeContext);
            const context: SignatureProviderContext = maybeContext!;

            expect(context.maybeFunctionName).to.equal("Date.AddDays");
            expect(context.maybeArgumentOrdinal).to.equal(1);
        });

        it("Date.AddDays(d,1|", () => {
            const [document, position]: [Utils.MockDocument, Position] = Utils.documentAndPositionFrom(
                "Date.AddDays(d,1|",
            );
            const inspected: PQP.Task.InspectionOk = Utils.expectInspectionOk(document, position);
            const maybeContext: SignatureProviderContext | undefined = InspectionUtils.maybeSignatureProviderContext(
                inspected,
            );
            assert.isDefined(maybeContext);
            const context: SignatureProviderContext = maybeContext!;

            expect(context.maybeFunctionName).to.equal("Date.AddDays");
            expect(context.maybeArgumentOrdinal).to.equal(1);
        });

        describe("file", () => {
            it("DirectQueryForSQL file", () => {
                const document: Utils.MockDocument = Utils.documentFromFile("DirectQueryForSQL.pq");
                const position: Position = {
                    line: 68,
                    character: 23,
                };
                const inspectionOk: PQP.Task.InspectionOk = Utils.expectInspectionOk(document, position);

                expectScope(inspectionOk, [
                    "ConnectionString",
                    "Credential",
                    "CredentialConnectionString",
                    "DirectSQL",
                    "DirectSQL.Icons",
                    "DirectSQL.UI",
                    "OdbcDataSource",
                    "database",
                    "server",
                ]);

                assert.isDefined(
                    inspectionOk.maybeActiveNode?.maybeIdentifierUnderPosition,
                    "position identifier should be defined",
                );

                expect(inspectionOk.maybeActiveNode?.maybeIdentifierUnderPosition?.kind).equals(
                    PQP.Ast.NodeKind.Identifier,
                    "expecting identifier",
                );

                const identifier: PQP.Ast.GeneralizedIdentifier | PQP.Ast.Identifier = inspectionOk.maybeActiveNode!
                    .maybeIdentifierUnderPosition!;
                expect(identifier.literal).equals("OdbcDataSource");
                expect(identifier.tokenRange.positionStart.lineNumber).equals(68);
            });
        });
    });
});