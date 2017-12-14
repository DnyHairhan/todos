// Model
var appModel = Backbone.Model.extend({
  defaults: {
    state: false,
    content: ''
  },
  idAttribute:'id',
  initialize() {
    this.on('invalid',function(model, error) {
      return error;
    })
  },
  validate(obj) {
    for(var attr in obj) {
      if(obj[attr] === '') {
        return '内容不能为空';
      }
    }
  }
})

// Collection
var AppCollection = Backbone.Collection.extend({
  model: appModel
})

var appColl = new AppCollection();
// ItemView

var ItemView = Backbone.View.extend({
  tagName:'li',
  className:'item',
  template: _.template($('#item-temp').html()),
  initialize() {
  _.bindAll(this, 'listDetails');
    this.model.on('change', this.render, this);
    this.model.on('destroy', this.remove, this);
  },
  events: {
    'click .check': 'toggleState',
    'click .icon': 'dele',
    'mouseover .icon': 'moseover',
    'mouseout .icon': 'moseout',
    'click': 'listDetails'
  },
  toggleState(e) {
    var ischecked = e.currentTarget.checked;
    this.model.set({state: ischecked});
  },
  dele() {
    this.model.destroy();
  },
  render() {
    this.$el.html(this.template(this.model.toJSON()));
    if(this.model.get('state')) {
      this.$el.addClass('completed');
    } else {
      this.$el.removeClass('completed');
    }
    return this;
  },
  remove() {
    this.$el.remove();
  },
  moseover(e) {
    $(e.currentTarget).find('.iconfont').removeClass('icon-close').addClass('icon-closecircled')
  },
  moseout(e) {
    $(e.currentTarget).find('.iconfont').removeClass('icon-closecircled ').addClass('icon-close')
  },
  listDetails() {
    this.$el.addClass('greenBg').siblings('.item').removeClass('greenBg');
  }
})

// footerItem
var footerItem = Backbone.View.extend({
  el:'footer',
  template: _.template($('#footer-temp').html()),
  events: {
    'click .completedBtn': 'clearCompletedItem'
  },
  render(completedItem, undoneItem) {
    this.$el.html(this.template(
      {
        'undoneItem': undoneItem.length,
        'completedItem': completedItem.length
      }
    ));
    if(completedItem.length === 0) {
      $('.completed-item').addClass('hide');
    } else {
      $('.completed-item').removeClass('hide');
    }
    return this;
  },
  clearCompletedItem() {
    var removed = this.collection.models.filter(function(model) {
      return model.get('state');
    })
    this.collection.remove(removed); //传递数组
  }
})

// appView
var AppView = Backbone.View.extend({
  el:'.app',
  events: {
    'keyup': "create",
    'blur .text': 'blur',
    'click .all': 'allChecked'
  },
  initialize() {
    this.n = 0;
    _.bindAll(this, 'create');
    this.coll = appColl;
    this.footer = new footerItem({collection:this.coll});
    this.DegreeCompletion();
    this.coll.on('add', this.render, this);
    this.coll.on('add', this.changeSate, this);
    this.coll.on('add', this.DegreeCompletion, this);

    this.coll.on('change', this.DegreeCompletion, this);
    this.coll.on('change', this.changeSate, this);// Collection 的change事件

    this.coll.on('remove', this.removed, this);
    this.coll.on('remove', this.DegreeCompletion, this);
    this.coll.on('remove', this.changeSate, this);
    window.location.hash = '';
  },
  create(e) {
    if(e.keyCode === 13) {
      var model = new appModel();
      var obj = {};
      obj.content = $('header input').val();
      var validated = !!model.set(obj, {validate: true});
      if(validated) {
        // model.set({id: ++this.n});
        this.coll.add(model);
      }
    }
  },
  blur() {
    $('.text').val('');
  },
  changeSate() {
    var selected = this.coll.models.filter(function(model) {
      return model.get('state');
    });
    if(selected.length === 0 && this.coll.models.length === 0) {
      $('.all').prop('checked', false);
      return;
    }
    var allSelected = selected.length === this.coll.models.length;
    $('.all').prop('checked', allSelected);

  },
  render(model) {
    var item = new ItemView({model: model});
    $('.list').append(item.render().el);
    $('.text').val('');
    this.DegreeCompletion();
  },
  allChecked(e) {
    var checked = e.currentTarget.checked;
    $(this.coll.models).each(function(key, everyModel) {
      everyModel.set({state: checked});
    })
  },
  DegreeCompletion() {
    var completedItem = this.coll.models.filter(function(model) {
      return model.get('state');
    });
    var undoneItem = this.coll.models.filter(function(model) {
      return !model.get('state');
    });

    this.footer.render(completedItem, undoneItem);
  },
  removed(removedModel) {
    removedModel.destroy();
  }
})
var app = new AppView();
