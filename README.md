# hardwareDemo README

This is a demo of a hypothetical analytics dashboard for a hardware startup. You can see a live demo of it [here](http://mikezawitkowski.github.io/hardwareDemo/).

Not long ago I was asked to help a startup with a popular internet-connected piece of hardware to get data out of each device, into a data warehouse, and displayed in an interactive dashboard that updated as new data came in.

This isn't the same dashboard, but it was inspired by it. It gives you an idea of what was done, so you can think of the options for your own company or project.

I'm using a dummy set of data, again, there's nothing here that could be used to identify an person or entity, or contains anything proprietary.

This project originally started out using crossfilter.js in its pure form, along with d3.js, but it wasn't long before it needed to do more complex things, and allow for more modularity in adding and removing charts, so bootstrap and dc.js were added to the mix.

For data processing, there are small small python scripts which interacted with log files generated by NSQ, to clean the data, store it in a place that future data engineers could easily access, but also I take a cut of that cleaned dataset and use it to populate these visualizations.

I love how easy it is to change one variable and have it update elsewhere. Also, the ability to set the filters and then download the data into a csv format was a special request. I personally don't like the way that the downloaded csv file is exactly what you are seeing on the html table, but the client wanted to leave it. I do like the fact that the client was able to grab the source files being used to create this dataset, or even the raw data in csv format (the latter of which I've omitted from this).
