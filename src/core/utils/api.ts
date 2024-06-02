export function postData(url: string, data: any) {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    var myInit = {
        method: 'POST',
        headers: myHeaders,
    };

    var myRequest = new Request(url,{
        body: JSON.stringify(data),
        method: 'POST',
    });

    fetch(myRequest, myInit).then(function (response) {
        console.log(response.text());
    });
}