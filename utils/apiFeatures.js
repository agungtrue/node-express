class APIFeature {
    constructor(modelQuery, queryStrings) {
        this.modelQuery = modelQuery;
        this.queryStrings = queryStrings;
    }

    filter() {
        const queryObj = { ...this.queryStrings };
        const excludeRequest = ['page', 'sort', 'limit', 'fields'];
        excludeRequest.forEach(el => delete queryObj[el]);

        let queryStrings = JSON.stringify(queryObj)
        queryStrings = queryStrings.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        const newQueryStrings = JSON.parse(queryStrings);

        this.modelQuery = this.modelQuery.find(newQueryStrings);
        return this;
    }

    sort() {
        let sorting = '-createdAt';
        if(this.queryStrings.sort) {
            sorting = this.queryStrings.sort.split(',').join(' ');
        }

        this.modelQuery = this.modelQuery.sort(sorting);
        return this;
    }

    fields() {
        let fields = '-__v';
        if(this.queryStrings.fields) {
            fields = this.queryStrings.fields.split(',').join(' ');
        }

        this.modelQuery = this.modelQuery.select(fields);
        return this;
    }

    paginate() {
        const page = Number(this.queryStrings.page) || 1;
        const limit = Number(this.queryStrings.limit) || 10;
        const skip = (page -1) * limit;

        this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        return this;
    }

    async totalData() {
        const total = await this.modelQuery.find();
        return total.length;
    }
}

module.exports = APIFeature;