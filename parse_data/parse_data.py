import os
import ujson as json
import re

import argparse

parser = argparse.ArgumentParser()
parser.add_argument('folder')

args = parser.parse_args()

folder_path = args.folder


# check what files there are to parse
files = []
for file_name in sorted(os.listdir(folder_path)):
	if file_name[0] == 'C':
		l = len(file_name) - 18
		n = ''
		for i in range(l):
			n = n+(file_name[1 + i])
		# print n
		files.append(n) 
print files

# create a folder to put them in
if not os.path.exists('../'+folder_path):
	os.makedirs('../'+folder_path+'/')

data = []
configurations = []

with open('../'+folder_path+'/averages.json', 'wb') as output_f:
	print '*** writing averages.json ***'

	averages = []
	for i, f in enumerate(files):
		# av_list = [{'x':0, 'c':0, 'u':0}]
		av_list = [[[0],[0],[0]]]
		# print len(av_list)
		av_dict = {'x':0, 'c':0, 'u':0}
		current_file = f
		rows = []
		config = []
		index = 0
		# read traffic data
		with open(folder_path+'/C'+current_file+'Visualization.txt') as data_f:
			print '*** reading data file ' + str(i) + ' of ' + str(len(files)) + ' ***'
			
			# next(data_f)
			

			for i, row in enumerate(data_f):
				# print row
				if i == 0:
					config = row.strip()
				else:
					r = row.strip().split()
					rows.append(r)
					if i > 1:
						if index < r[0]:
							# print r[0]
							av_list.append([[0],[0],[0]])
							index = int(r[0])

						if r[4] == 'X':
							av_list[index][0][0] += 1
							# print r[4]
						elif r[4] == 'C':
							av_list[index][1][0] += 1
							# print r[4]
						elif r[4] == 'U':
							# print r[4]
							# print av_list[index]
							av_list[index][2][0] += 1

		data.append(rows)
		configurations.append(config)
		averages.append(av_list)
	output_f.write('{')
	for i, f in enumerate(files):
		# print len(averages[i])
		print '** file: ' + str(f) + ' ***'
		if i > 0:
			output_f.write(",\n")
		output_f.write('"' + f + '":\n\t[\n')
		# for max number of timesteps
		for j in range(1, 3002):

			total = averages[i][j][0][0] + averages[i][j][1][0] + averages[i][j][2][0]
			# print total
			if total == 218:
				if j > 1:
					output_f.write(',\n')
				output_f.write('\t\t{"X": ')
				output_f.write(str(averages[i][j][0][0]))
				output_f.write(', "C": ')
				output_f.write(str(averages[i][j][1][0]))
				output_f.write(', "U": ')
				output_f.write(str(averages[i][j][2][0]))
				output_f.write('}')
		output_f.write('\n\t]')
	output_f.write('\n}')



dataDict = {}
maxRates = []

config_split = config.strip().split()
config_l = len(config_split)

# print config_split



for i, f in enumerate(files):
	print '** file:', str(f)
	maxRate = re.sub('[^\d\.]', '',config_split[config_l-3])
	increment = re.sub('[^\d\.]', '',config_split[config_l-1])
	# print 'maxRate:', maxRate, 'increment:', increment
	
	maxRates.append(maxRate)
	injectionRate = []
	for j in range(int(maxRate)/int(increment) + 1):
		router = []
		for k in range(1, 219): # since there are 218 routers
			lineDict = {}
			for l, item in enumerate(data[i][j*218 + k]):
				lineDict[data[0][0][l]] = item
				# print data[0][0][l], item
				# injectionRate.append({data})
			router.append(lineDict)
		injectionRate.append(router)
	dataDict[f] = injectionRate

# write data as JSON v3
with open('../'+folder_path+'/routerData.json', 'w') as output_f:
	json.dump(dataDict, output_f)




with open('../'+folder_path+'/configurations.json', 'w') as output_f:
	print '*** writing configurations.json ***'
	output = {}
	f_names = []
	for i, f in enumerate(files):
		f_names.append(f)
	
	output['files'] = f_names
	

	c_names = []
	for i, c in enumerate(configurations):

		c_names.append(c)
	output['configurations'] = c_names

	output['numFiles'] = str(len(files))
	
	output['groupSize'] = [16, 32, 122, 8, 40]

	max_r = []
	for i, m in enumerate(maxRates):
		max_r.append(str(m))
	output['maxRates'] = max_r

	output['groupStrings'] = ["B", "P", "A", "D", "F"]
	output['groupFullStrings'] = ["Backbone Routers", "Pop Routers", "Normal Access Routers", "Directly Connected Routers", "Fast Access Routers"]
	output['occupancyTitles'] = ["Cut off", "Congested", "Unoccupied"]
	output['increment'] = str(increment)
	json.dump(output, output_f)





print 'done'
