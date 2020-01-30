var mainTableNode = document.getElementById("mainTable");

function getData(page) {
    console.log(page);
    fetch("http://acmhelper.zhoushouhao.com:8080?page="+page, {
        method: "get",
        mode: "cors"
    })
        .then(function (r) {
            return r.json()
        }).then(function (data) {
            // console.log(data);
            var htmlstr = `<tr class="title">
            <td width=8%>Pro. ID</td>
            <td>Problem Title</td>
            <td width=20%>Tags</td>
            <td width=8%>Ratio</td>
        </tr>`;
            data.forEach(element => {
                htmlstr += `<tr"><td>${element.Pro_ID}</td><td><a href="${element.Link}">${element.Title}</a></td><td>${element.Tags}</td><td>${element.Ratio}</td></tr>`;
            });
            mainTableNode.innerHTML = htmlstr;
        });
}
