class Post < ActiveRecord::Base
	belongs_to :user

	def self.parse (array)
		# replace all the stringified numbers with integers
		# i.e. "1" ---> 1
	  array.map!{|x| Integer(x)}
	end

end