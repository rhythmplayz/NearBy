import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .models import Order


class OrderConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        # URL route should provide order_id
        self.order_id = self.scope['url_route']['kwargs'].get('order_id')
        self.group_name = f'order_{self.order_id}'

        # Basic auth check: allow connection if user is authenticated
        user = self.scope.get('user')
        if not user or user.is_anonymous:
            # refuse connection for anonymous (for security)
            await self.close()
            return

        # Verify that the user is owner, assigned driver, or staff
        order = await database_sync_to_async(self._get_order)()
        if not order:
            await self.close()
            return

        if not (user.is_staff or order.user_id == user.id or (order.assigned_to_id and order.assigned_to_id == user.id)):
            await self.close()
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    def _get_order(self):
        try:
            return Order.objects.get(pk=self.order_id)
        except Order.DoesNotExist:
            return None

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def order_update(self, event):
        # event['data'] should be JSON-serializable
        await self.send_json({
            'type': 'order.update',
            'data': event.get('data', {})
        })

    async def receive_json(self, content, **kwargs):
        # For now we don't accept client messages
        pass
