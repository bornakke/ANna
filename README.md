# ANna - v0.5
Actor-Network NAvigator is a tool to publish big network as interactive network visualizations developed in collaboration between the SceincePo Medialab (http://tools.medialab.sciences-po.fr/) and Copenhagen University (KU.dk).

## Background

ANna is a tool to publish big network as interactive network visualizations. ANna got its inspiration from the recent tool, ManyLines, which attempts to sustain the users explore of a network while parallel offering tool to construct a narrative around this exploration through the ability to take and arrange screenshots of the network.  While ManyLines is an excellent tools for researchers looking for a way to easily tell a story of a network, it is less minded toward letting the end user explore the network themselves. Also the tool, being mainly for users that have some but not a lot of experience in the field of network science, leaving  out more advanced filtering that network experts would miss as well as the user group with no prio knowledge of network manipulation.

ANna thus attempts to fill this gap by attempting to distribute the exploration between the network expert wanting to publish his and her network and the end user with no prio network knowledge. By focusing on exploration rather than building narrative ANna is especially minded on very big Networks (+5000 nodes) where the network owner never knows what narratives the end user would want to tell. ANna is build on the Sigma.JS package (developed by Medialab), which make it possible to publish and explore networks on the internet. ANna works on top of Sigma offering an easy configurable setup for network owners to publish and share their network with the possibility to select between a numbers of available filtering mechanisms. 


## How to use it

1) Download all files in the reporsitory to a folder on a server.
2) Export a Gexf file from Gephi and add it to the /data folder for every network that you want to make avaiable for exploration.
3) Fill out the ini.json file as explained below.
4) Share your url :)

###ini.json
####Glboal settings:
**-header:** Global header for the project (string)
**-graph1, graph2 etc.:** Defines the number of graphs to be drawn. Simply copy/paste graph1 and rename it to graph2 if you want to add another graph to the navigation. 

####Graph setup 
**-graph_header:** The header that will be shown on top of your page (string)
**-basemap:** URL to the gexf file that you want to make explorative (url)
**-logo_url:** Optional logo for the network when making avaiable more than one network (url)
**-spatilize:** If true, ongoingly Spatilize network with ForceAtlas2 (true/false).

####Graph _by
We turn on interaction with the graph by making filling out the the arrays:

**-filter_by:** Give the user the ability to filter based on one or more columns in the dataset.
**-highlight_by:** Give the user the ability to highlight based on one or more columns in the dataset.
**-color_by:** Give the user the ability to color graph based on one or more columns in the dataset.
**-compare_by:** Give the user the ability to compare nodes based on one or more columns in the dataset.
**-merge_by:** Give the user the ability to merge nodes based based on one or more columns in the dataset.
**-details_view:** Provide the user with the posibility to explore specific attributes of the nodes when clikcing it.

*label:* The name of the filter to appear in ANna (string).
*gephiCol:* The name of the column you wish to apply as written in the Gexf file (or Gephi data labaoratory). Setting the first coloumn in gephiCol to "" means that no filter should be applied (string). 
*keepNeighbors:* If true, then the filter will not only affect the specific nodes or should the neighberhood of the node likewise be affected (true/false).


##Troubleshouting
JSON files can be very sensitive to type errors and alike. If no graph is showing then try to copy/paste the content of ini.json to json lint (http://jsonlint.com/) to validate the file.