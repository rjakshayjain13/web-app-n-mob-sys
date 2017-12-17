Part 2:

	- Sleep was functional for us but we commented out since its removed from requirements.

	
	- You can change the options object as per the requirements. 
		Our options object looks like this:

			var options = {
        
				server: 'www.cse.iitd.ernet.in',
        
				port: 80,
        
				local_port: '8040',
        
				max_requests: 3
      
				//delay: 1000
    
			};

	
	- MAX-REQUESTS functional for a single browser for a time frame.



Part 3:
	
- Cache options are specified as:
    
		var cache = LRU({
        
			maxAge: 600000,
        
			max: options.cache_size *1024,
        
			length: function(n, key){
            
				return n.length;
        
			},
        
			stale: false
    
		})
