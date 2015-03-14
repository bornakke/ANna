# ANna ![Logo](https://github.com/bornakke/ANna/blob/master/css/images/annalogo_small.png) 
Actor-Network NAvigator is a tool to publish big network as interactive network visualizations. The tool is developed in collaboration between the SceincePo Medialab (http://tools.medialab.sciences-po.fr/) and Copenhagen University (KU.dk).

### Background
Through the last decade, visualizing networks has become an established technique in the social sciences. In this period a number of professional tools such as Gephi (http://gephi.org), Manylines (http://tools.medialab.sciences-po.fr/manylines) and Palladio (http://palladio.designhumanities.org/) have emerged. A commonality across these tools have been an intrinsic workflow built around a network trained person applying the tool to identify interesting narratives in the network, before exporting the network as a static image to document the results.

This approach have shown to work great in the case where the network skilled person and issue expert are one and the same person and where the story to be told can in fact be summarized in a static image. 

However, as it has become easier to collect and groom digital data, both the datasets itself and the potential narratives to be told have grown in size often extending their reach beyond the interests and fields of a single person. This change has called upon the network science to develop new workflows where the network analysis is redistributed in new ways and across more actors. Particularly, constructing collaborative workflows and tools to redistribute the analytical work between network and field experts.

ANna is a tool developed to respond to this demand by providing a quick - and non-technical – approach to publish network data in an explorative format. The primary idea of ANna is to redistribute the exploration between the network expert wanting to publish his and her network and the end user with no prior network knowledge. By focusing on exploration rather than building narrative ANna is especially minded on very big Networks (+5000 nodes).

## How to use it
The free open-source version of ANna is simply deployed on any web-server or computer together with a spatilized graph file (.gexf). Through a simple interface, the data owner is able to configure the elements in the navigation interface, designing the potentially meaningful ways of exploring the particular dataset. 

1) Download all files in the reporsitory to a folder on a server.
2) Export a Gexf file from Gephi and add it to the /data folder for every network that you want to make avaiable for exploration.
3) Fill out the ini.json file as explained below.
4) Share your url :)

###ini.json
####Glboal settings:
- **header:** Global header for the project (string)
- **graph1, graph2 etc.:** Defines the number of graphs to be drawn. Simply copy/paste graph1 and rename it to graph2 if you want to add another graph to the navigation. 

####Graph setup 
- **graph_header:** The header that will be shown on top of your page (string)
- **basemap:** URL to the gexf file that you want to make explorative (url)
- **logo_url:** Optional logo for the network when making avaiable more than one network (url)
- **spatilize:** If true, ongoingly Spatilize network with ForceAtlas2 (true/false).

####Graph _by
We turn on interaction with the graph by making filling out the the arrays:

- **filter_by:** Give the user the ability to filter based on one or more columns in the dataset.
- **highlight_by:** Give the user the ability to highlight based on one or more columns in the dataset.
- **color_by:** Give the user the ability to color graph based on one or more columns in the dataset.
- **compare_by:** Give the user the ability to compare nodes based on one or more columns in the dataset.
- **merge_by:** Give the user the ability to merge nodes based based on one or more columns in the dataset.
- **details_view:** Provide the user with the posibility to explore specific attributes of the nodes when clikcing it.

> *label:* The name of the filter to appear in ANna (string).
> *gephiCol:* The name of the column you wish to apply as written in the Gexf file (or Gephi data labaoratory). Setting the first coloumn in gephiCol to "" means that no filter should be applied (string). 
> *keepNeighbors:* If true, then the filter will not only affect the specific nodes or should the neighberhood of the node likewise be affected (true/false).


##Troubleshouting
- JSON files can be very sensitive to type errors and alike. If no graph is showing then try to copy/paste the content of ini.json to json lint (http://jsonlint.com/) to validate the file.
- Please check that all fields except label fields is lowercased in the ini.json file.  
