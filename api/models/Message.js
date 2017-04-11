module.exports = {
    attributes:{
        
    },

    // query with a given criteria statically
    heuristicQuery: async (params)=>{
        
        //TODO: implement query logic to query heuristics for this set of parameters
        
        let limit = params.limit || process.env.DEFAULT_LIMIT;

        let data = await Message.find({}).limit(limit);
        return data;
    },

    heuristicGroup: async (params)=>{
        
        //TODO: implement query logic to query heuristics for this set of parameters
        
        let limit = params.limit || process.env.DEFAULT_LIMIT;

        let data = await Message.find({}).limit(limit);
        return data;
    },

    heuristicTotal: async (params)=>{
        
        //TODO: implement query logic to query heuristics for this set of parameters
        
        let limit = params.limit || process.env.DEFAULT_LIMIT;

        let data = await Message.query("SELECT COUNT(id) as total FROM message");
        // console.log(data);
        return {
            total:_.first(data).total
        };
    }
}