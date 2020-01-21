var pageRowNode = document.getElementById("pageRow");

function getCurrentCatalog(page) {
    getData(page);
    var htmlstr = ``;

    if(page-6<1){
        min = 1;
        max = 12;
    }
    else if(page+5>58){
        min = 58-11;
        max = 58;
    }
    else{
        min = page-6;
        max = page+5;
    }
    for (var i = min; i <= max; i++) {
        if(i==min&&page>7){
            htmlstr += `<td width=30px style="text-align: center;font-weight: bold;">...</td>`;
            continue;
        }
        if(i==min+11&&page<53){
            htmlstr += `<td width=30px style="text-align: center;font-weight: bold;">...</td>`;
            continue;
        }
        if (i == page) {
            htmlstr += `<td width=30px style="text-align: center;font-weight: bold;">${i}</td>`;
        }
        else {
            htmlstr += `<td width=30px style="text-align: center;"><a href="javascript:getCurrentCatalog(${i})">${i}</a></td>`;
        }
    }
    pageRowNode.innerHTML = htmlstr;
}