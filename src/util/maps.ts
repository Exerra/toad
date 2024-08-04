export const searchPlacesByText = async (name: string, fields: "places" | "reviews" | "*", apiKey: string) => {
    const res = await fetch(`https://places.googleapis.com/v1/places:searchText?fields=${fields}&key=${apiKey}`, {
        method: "POST",
        body: JSON.stringify({
            textQuery: name
        }) 
    })

    const data = await res.json()

    delete data.places[0].reviews
    delete data.places[0].viewport

    return data.places[0]
}