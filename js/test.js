(function ($) {
    $(document).ready(function () {
        var model1 = {
            vals: {
                value1: "Cat",
                value2: "Dog"
            }
        };
        var applier1 = fluid.makeChangeApplier(model1);
        applier1.modelChanged.addListener("vals", function (model, changeRequest) {
            console.log("Model 1 has changed: value1 = "+applier1.model.vals.value1+", value2 = "+applier1.model.vals.value2);
        });
        var tree1 = {
            children: [
                {ID: ".my-input-1", valuebinding: "vals.value1"},
                {ID: ".my-input-2", valuebinding: "vals.value2"}
            ]
        };
        var cutpoints1 = [
            {id: ".my-input-1", selector: ".my-input-1"},
            {id: ".my-input-2", selector: ".my-input-2"}
        ];
    
        var model2 = {
            vals: {
                value1: "Chat",
                value2: "Chien"
            }
        };
        var applier2 = fluid.makeChangeApplier(model2);
        applier2.modelChanged.addListener("vals", function (model, changeRequest) {
            console.log("Model 2 has changed: value1 = "+applier2.model.vals.value1+", value2 = "+applier2.model.vals.value2);
        });
        var tree2 = {
            children: [
                {ID: ".my-input-1", valuebinding: "vals.value1"},
                {ID: ".my-input-2", valuebinding: "vals.value2"}
            ]
        };
        var cutpoints2 = [
            {id: ".my-input-1", selector: ".my-input-1"},
            {id: ".my-input-2", selector: ".my-input-2"}
        ];
        
        var template1 = fluid.selfRender($(".first-block"), tree1,
            {autoBind: true,
             model: model1,
             applier: applier1,
             cutpoints: cutpoints1,
             debugMode: true});
        var template2 = fluid.selfRender($(".second-block"), tree2,
            {autoBind: true,
             model: model2,
             applier: applier2,
             cutpoints: cutpoints2,
             debugMode: true});
     });
})(jQuery);
