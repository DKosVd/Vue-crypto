
<template>
<div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
  <div v-if="showPreloader" class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center">
    <svg class="animate-spin -ml-1 mr-3 h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>
  <div class="container">
    <add-ticket @add-new-ticket="add"/>
    <button
        @click="openModal"
        class="my-4 ml-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >Открыть
    </button>
    <modal ref="modal"> 
      <template #body>
        <p>From App.vue</p>
      </template> 
      <template #footer="{close, confirm}">
         <div class="flex justify-end pt-2">
            <div class="mt-1 relative rounded-md">
            <input
              type="text"
              name="delete"
              id="delete"
              v-model="deleteKey"
              class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
              placeholder="Name of delete"
            />
          </div>
          <button class="px-4 bg-transparent p-3 rounded-lg text-indigo-500 hover:bg-gray-100 hover:text-indigo-400 mr-2" @click="confirm">Action</button>
          <button class="modal-close px-4 bg-indigo-500 p-3 rounded-lg text-white hover:bg-indigo-400" @click="close">Close</button>
        </div>
      </template>
    </modal>
    <template v-if="tickets.length">
    <div>
       <button
            v-if="page > 1"
            @click="page = page - 1"
            class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >Назад
          </button>
          <button
            @click="page = +page + 1"
            v-if="hasNextPage"
            class="my-4 ml-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >Вперед
          </button>
    </div>
    <div>
      Поиск: <input type="text" v-model="filter"/>
    </div>
      <hr v-if="tickets.length" class="w-full border-t border-gray-600 my-4" />
      <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div
          v-for="ticket of paginatedTickets"
          @click="selectedTicketect(ticket)"
          :key="ticket.name"
          :class = "{ 
            'border-4': selectedTicket === ticket,
          }"
          class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
        >
          <div
            :class="{
               'bg-red-300': invalidSubscribe.includes(ticket.name)
            }" 
           class="px-4 py-5 sm:p-6 text-center">
            <dt class="text-sm font-medium text-gray-500 truncate">
              {{ticket.name}} - USD
            </dt>
            <dd  
             class="mt-1 text-3xl font-semibold text-gray-900">
              {{priceView(ticket.price)}}
            </dd>
          </div>
          <div class="w-full border-t border-gray-200"></div>
          <button
            @click.stop="remove(ticket)"
            class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
          >
            <svg
              class="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="#718096"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              ></path></svg>Удалить
          </button>
        </div>
      </dl>
      <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <graph-currency  :selectedTicket="selectedTicket" ref="graph" @delete-graph="selectedTicket = null" :normalizedGraph="normalizedGraph"/>
  </div>
</div>
</template>

<script>
import api, { subscribeToTicket, unSubscribeFromTicket } from './api.js'
import { getNewPriceFromChannel } from './broadcastchannel.js'
import addTicket from './components/addTicket.vue'
import graphCurrency from './components/graphCurrency.vue'
import modal from './components/modal.vue';


export default {
  components: { addTicket, graphCurrency, modal },
  name: 'App',
  data() {
    return {
      tickets: [],

      selectedTicket: null,

      showPreloader: true,

      graph: [],

      deleteKey: '',

      foundCurrencies: [],
      currencies: null,
      dublicate: false,

      page: 1,
      filter: '',

      invalidSubscribe: [],

      maxElementOfBar: 1
    }
  },

  mounted() {
    this.getCurrency();
    window.addEventListener('resize', () => this.calculateMaxBarOnGraph())
  },

  beforeUnmount() {
    window.removeEventListener('resize', () => this.calculateMaxBarOnGraph())
  },

  created: function() {
    const VALID_KEYS = ['filter', 'page'];
    const urlData = Object.fromEntries(new URL(window.location).searchParams.entries())
    VALID_KEYS.forEach(key => {
      if(urlData[key]) {
        this[key] = urlData[key]
      }
    })

    getNewPriceFromChannel(this.updatePrice, ({err, ticket}) => {
      if(!err) {
        return
      }
      this.invalidSubscribe.push(ticket.name)
    })

    const ticketsData = window.localStorage.getItem('crypto-app');
    if(ticketsData) {
      this.tickets = JSON.parse(ticketsData);
    }
    this.tickets.forEach( ticket => subscribeToTicket(ticket.name, (price, err) => {
       if(err) {
         this.invalidSubscribe.push(ticket.name)
         return
       }
       this.updatePrice(ticket.name, price)
     }))
  },

    //  filteredTickets() {
    //   const start = (this.page - 1) * 6;  
    //   const end = this.page * 6;
    //   const filteredTickets = this.tickets.filter(ticket => ticket.name.includes(this.filter.toUpperCase()))

    //   this.hasNextPage = filteredTickets.length > end

    //   return filteredTickets.slice(start, end)
    // },


    // normalizeGraph() {

    //   const maxValue = Math.max(...this.graph)
    //   const minValue = Math.min(...this.graph)

    //   return this.graph.map(
    //     price => 5 + ((price - minValue) * 95) / (maxValue - minValue)
    //   );

    // }

  computed: {

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page
      }
    },

    maxValue() {
        return Math.max(...this.graph);
    },

    minValue() {
      return Math.min(...this.graph);
    },

    normalizedGraph() {
      if(this.maxValue === this.minValue) {
        return this.graph.map(() => 50)
      }
      return this.graph.map(
         price => 5 + ((price - this.minValue) * 95) / (this.maxValue - this.minValue)
      );
    },

    startIndex() {
      return (this.page - 1) * 6;
    },

    endIndex() {
      return this.page * 6;
    }, 

    filteredTickets() {
       return this.tickets.filter(ticket => ticket.name.includes(this.filter.toUpperCase()))
    },
    paginatedTickets() {
      return this.filteredTickets.slice(this.startIndex, this.endIndex)
    },
    hasNextPage() {
      return this.filteredTickets.length > this.endIndex
    }
  },

  watch: {

    paginatedTickets() {
      if(this.paginatedTickets.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },

    tickets() {
      window.localStorage.setItem('crypto-app', JSON.stringify(this.tickets))
    },

    selectedTicket() {
      this.graph = [];
      //Не успевает сразу обновить, поэтому необходимо использовать nextTick, чтобы пересчитать количество максимальным столбцов на графике
      //Внутри nextTick dom обновлен
      this.$nextTick().then(() => this.calculateMaxBarOnGraph())
    },

    filter() {
      this.page = 1;
    },

    pageStateOptions() {
      window.history.pushState(null, document.title, `${window.location.pathname}?filter=${this.filter}&page=${this.page}`)
    },

    currencies() {
      this.showPreloader = false
    }
  },

  methods: {
    async openModal() {
        const modal = await this.$refs.modal.open();
        if(modal) {
            alert('confirm')
        }
    }, 

    calculateMaxBarOnGraph() {
      if(!this.$refs.graph && !this.$refs.elemOfBar) 
      {
        return;
      }
      this.maxElementOfBar = Math.round(this.$refs.graph.clientWidth() / 38)  
      this.updateGraphView()
    },

    async getCurrency() {
      const currencies = await api.getCurrency();
      this.currencies = currencies.Data
    },

    updateGraphView() {
      if(this.graph.length > this.maxElementOfBar) {
          this.graph = this.graph.slice(this.graph.length - this.maxElementOfBar) 
        }
    },

    updatePrice(ticket, price) {
      this.tickets.forEach( currentTicket => {
        if(currentTicket.name === ticket) {
          currentTicket.price = price;
        }
        if(currentTicket === this.selectedTicket) {
          this.graph.push(price)
          this.updateGraphView()
        }
      })
    },

    // async updateTickets() {
    //     const exchangeData = await api.getPriceByName(this.tickets.map(ticket => ticket.name));
    //     this.tickets.forEach(ticket => {
    //       const price = exchangeData[ticket.name.toUpperCase()];
    //       ticket.price = price;
    //     })
    // },

    priceView(price) {
      if(price === '-') {
        return price
      }
      return  price > 1 ? price.toFixed(2) : price.toPrecision(2); 
    },

    findMatches() {

      if(this.dublicate && !this.tickets.find(ticket => ticket.name.toUpperCase() === this.ticketValue.toUpperCase())) {
        this.dublicate = false;
        return
      }

      for(let curr in this.currencies) {
        if(~curr.indexOf(this.ticketValue.toUpperCase())) {
          if(this.foundCurrencies.length >= 4) {
            this.foundCurrencies = [curr, ...this.foundCurrencies.slice(0, 3)]
          } else {
            this.foundCurrencies.push(curr)
          }
        }
      }

      this.foundCurrencies.forEach(founded => {
        if(!founded.includes(this.ticketValue.toUpperCase())) {
          this.foundCurrencies = [];
        }
      })

      if(!this.ticketValue) {
        this.foundCurrencies = []
      }

    },

    fastselectedTicketect(name) {
      this.ticketValue = name;
      this.add()
      this.foundCurrencies = []
    },


    selectedTicketect(ticket) {
      this.selectedTicket = ticket
    },

    add(ticketValue) {
      if(!ticketValue) {
        return
      }

      if(this.tickets.find(ticket => ticket.name.toUpperCase() === ticketValue.toUpperCase())) {
        this.dublicate = true;
        return
      }

      const newTicket = {
         name: ticketValue.toUpperCase(),
         price: '-'
      }
      this.tickets = [...this.tickets, newTicket]
      subscribeToTicket(newTicket.name, (price, err) => {
        if(err) {
         this.invalidSubscribe.push(newTicket.name)
         return
        }
        this.updatePrice(newTicket.name, price)
      })
      this.foundCurrencies = [] 
      this.filter = ''
    },

    remove(elementToRemove) {
      this.tickets = this.tickets.filter(el => el !== elementToRemove)
      unSubscribeFromTicket(elementToRemove.name)
      this.selectedTicket = null;
    },


  }
}
</script>

<style src="./app.css">

</style>
