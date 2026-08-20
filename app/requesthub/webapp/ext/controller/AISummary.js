sap.ui.define(
    [
        "sap/ui/core/Fragment",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/resource/ResourceModel",
        "sap/m/BusyDialog",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
    ],
    function (
        Fragment,
        JSONModel,
        ResourceModel,
        BusyDialog,
        MessageBox,
        MessageToast,
    ) {
        "use strict";

        const oI18nModel = new ResourceModel({
            bundleName: "com.portfolio.requesthub.i18n.i18n",
            async: true,
        });

        const getText = async (sKey) => {
            const oResourceBundle =
                await oI18nModel.getResourceBundle();

            return oResourceBundle.getText(sKey);
        };

        const openSummaryDialog = async (
            oRequestContext,
            oSuggestion,
        ) => {
            const oRequestModel = oRequestContext.getModel();
            const oDialogModel = new JSONModel({
                summary: oSuggestion.summary,
                provider: oSuggestion.provider,
                canAccept: Boolean(oSuggestion.summary.trim()),
            });

            let oDialog;

            const oDialogController = {
                onSummaryChange(oEvent) {
                    const sSummary = oEvent
                        .getParameter("value")
                        .trim();

                    oDialogModel.setProperty(
                        "/canAccept",
                        Boolean(sSummary),
                    );
                },

                async onAcceptAiSummary() {
                    const sSummary = oDialogModel
                        .getProperty("/summary")
                        .trim();

                    if (!sSummary) {
                        return;
                    }

                    const oAcceptAction =
                        oRequestModel.bindContext(
                            "RequestService.acceptAiSummary(...)",
                            oRequestContext,
                        );

                    oAcceptAction.setParameter(
                        "summary",
                        sSummary,
                    );

                    oDialog.setBusy(true);

                    try {
                        await oAcceptAction.invoke();

                        const oPageBinding =
                            oRequestContext.getBinding();

                        if (
                            oPageBinding &&
                            typeof oPageBinding.requestRefresh ===
                            "function"
                        ) {
                            await oPageBinding.requestRefresh();
                        }

                        oDialog.setBusy(false);

                        MessageToast.show(
                            await getText("aiSummaryAccepted"),
                        );

                        oDialog.close();
                    } catch (oError) {
                        oDialog.setBusy(false);

                        MessageBox.error(
                            await getText(
                                "aiSummaryAcceptError",
                            ),
                        );
                    } finally {
                        oAcceptAction.destroy();
                    }
                },

                onCancelAiSummary() {
                    oDialog.close();
                },

                onAfterClose() {
                    oDialog.destroy();
                    oDialogModel.destroy();
                },
            };

            oDialog = await Fragment.load({
                name: "com.portfolio.requesthub.ext.fragment.AISummaryDialog",
                controller: oDialogController,
            });

            oDialog.setModel(oI18nModel, "i18n");
            oDialog.setModel(oDialogModel, "dialog");
            oDialog.open();
        };

        return {
            /**
             * Generates an AI summary suggestion without saving it.
             *
             * The suggestion is saved only after the user reviews it
             * and confirms it in the dialog.
             *
             * @param {sap.ui.model.odata.v4.Context} oContext
             *   Binding context of the current request.
             */
            onGenerateAiSummary: async function (oContext) {
                if (!oContext) {
                    MessageBox.error(
                        await getText(
                            "aiSummaryGenerationError",
                        ),
                    );
                    return;
                }

                const oBusyDialog = new BusyDialog({
                    text: "{i18n>aiSummaryGenerating}",
                });

                oBusyDialog.setModel(oI18nModel, "i18n");
                oBusyDialog.attachClose(() => {
                    oBusyDialog.destroy();
                });

                let oGenerateAction;
                let sErrorTextKey = "aiSummaryGenerationError";

                try {
                    oBusyDialog.open();

                    oGenerateAction = oContext
                        .getModel()
                        .bindContext(
                            "RequestService.generateAiSummary(...)",
                            oContext,
                        );

                    // const oResultContext =
                    //     await oGenerateAction.invoke();

                    // const oSuggestion =
                    //     oResultContext &&
                    //     oResultContext.getObject();

                    await oGenerateAction.invoke();

                    const oResultContext =
                        oGenerateAction.getBoundContext();

                    const oSuggestion =
                        oResultContext &&
                        oResultContext.getObject();

                    if (
                        !oSuggestion ||
                        typeof oSuggestion.summary !== "string" ||
                        !oSuggestion.summary.trim()
                    ) {
                        sErrorTextKey =
                            "aiSummaryInvalidResponse";

                        throw new Error(
                            "The AI summary response is invalid.",
                        );
                    }

                    await openSummaryDialog(
                        oContext,
                        oSuggestion,
                    );
                } catch (oError) {
                    MessageBox.error(
                        await getText(sErrorTextKey),
                    );
                } finally {
                    if (oGenerateAction) {
                        oGenerateAction.destroy();
                    }

                    oBusyDialog.close();
                }
            },
        };
    },
);