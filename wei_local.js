
/**
 * hooks
 */
lpTag.hooks = lpTag.hooks || [];

// this works, trigger right before customer sends out a line
// would be useful for client side masking
console.log("register hook");
lpTag.hooks.push({
    name: "BEFORE_SEND_VISITOR_LINE",
    callback: function (options) {
        // options.data.answers = "masking answer";
        console.log("before send visitor line " + JSON.stringify(options));
        //options.data.line.text = "some text";
        return options;
    }
});

lpTag.hooks.push({
    name: "AFTER_GET_LINES",
    callback: function (options) {
        // options.data.answers = "masking answer";
        console.log("AFTER_GET_LINES " + JSON.stringify(options));
        let timeThreshold = 1664403006794;  // TODO: set time = now -24 hours

        Array.from(options.data.lines
            .filter(el => el.time < timeThreshold)
            .forEach(el => {
                console.log(el);  // TODO: masking logic
                //el.text = "masked ***";
            }));
        //options.data.line.text = "some text";
        return options;
    }
});
/**
 * end hooks
 */


/**
 * lptag sections
 */

lpTag.section = ["development"];

/**
 * end sections
 */



/**
 * push SDEs
 */

lpTag.sdes = lpTag.sdes || {};
// lpTag.section = ["wat-live", "english"];
lpTag.section = ["development"];
lpTag.sdes.push(
    {
        "type": "cart", //mandatory
        "total": 11.7, // total value of the cart affter discount
        "currency": "USD",
        "numItems": 6,
        "products": [{
            "product": {
                "name": "prod1",
                "category": "category",
                "sku": "sku",
                "prive": 7.8
            }, "quantity": 11
        }]
    }
);

/**
 * end SDEs
 */

