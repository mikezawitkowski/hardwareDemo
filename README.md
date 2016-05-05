# hardwareDemo README

Not long ago I was asked to help a startup with a popular internet-connected piece of hardware to get data out of each device, into a data warehouse, and displayed in an interactive dashboard that updated as new data came in.

This dashboard is a similar variation to that original dashboard. What they have now we have evolved a little bit further, so they get the coolest tools, but this older generation is scrubbed enough that it gives you an idea of what was done, so you can think of the options for your own company or project.

I've cleaned up the files and scrubbed the data of any identifying (of the company or the users) as well as anything proprietary. With that said, I think what we have here is pretty darn cool.

I started out using crossfilter.js in its pure form, along with d3.js, but as the feature set and requests from stakeholders became more complex, I ended up swapping in dc.js in order to handle this.

For data processing, there are small small python scripts which interacted with log files generated by NSQ, to clean the data, store it in a place that future data engineers could easily access, but also I take a cut of that cleaned dataset and use it to populate these visualizations.

I love how easy it is to change one variable and have it update elsewhere. Also, the ability to set the filters and then download the data into a csv format was a special request. I personally don't like the way that the downloaded csv file is exactly what you are seeing on the html table, but the client wanted to leave it. I do like the fact that the client was able to grab the source files being used to create this dataset, or even the raw data in csv format (the latter of which I've omitted from this)