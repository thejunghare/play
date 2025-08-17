async function createDocument(field1, field2){
    let result = await firebase.firestore().collection().createDocument({
        field1,
        field2
    })

    if (result) console.log(`Document created ${result}`)
}