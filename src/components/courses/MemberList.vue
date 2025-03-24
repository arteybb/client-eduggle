<template>
  <div>
    {{ courseId }}
    <h4 class="text-xl font-semibold mt-6 mb-3">Members</h4>
    <el-table v-loading="isLoading" :data="enrolledUsers" style="width: 100%">
      <el-table-column label="Display Name">
        <template #default="{ row }">
          <div class="flex gap-3 items-center">
            <img :src="row.photoURL" alt="photo" style="border-radius: 50%" />
            <div>
              {{ row.displayName }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Enrollment Date" prop="enrollmentDate" width="300">
        <template #default="{ row }">
          {{ formatDate(row.enrollmentDate) }}
        </template>
      </el-table-column>

      <el-table-column center v-if="isTeacherCourse === authStore.user.uid" label="Action" prop="enrollmentDate"
        width="200">
        <template #default="{ row }">
          <el-button circle @click="openDeleteDialog(row._id)">
            <el-icon>
              <Delete />
            </el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-dialog v-model="deleteConfirmationVisible" title="Confirm Delete" :width="isMobile ? '90%' : '600px'">
    <span>{{ deleteConfirmationMessage }}</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button round size="large" @click="deleteConfirmationVisible = false">Cancel</el-button>
        <el-button round size="large" type="danger" @click="handleDelete">Delete</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElTable, ElTableColumn } from 'element-plus';
import axios from 'axios';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useWindowSize } from '@/use/useWindowSize';
import { deleteMemberCourse, getMemberCourse } from '@/api/user/course.api';
const authStore = useAuthStore()
const route = useRoute();
const { mobileMode: isMobile } = useWindowSize()
const enrolledUsers = ref<any[]>([]);
const isTeacherCourse = ref()
const isLoading = ref(false)
const props = defineProps<{
  id: string;
}>();
const courseId = route.params.courseId as string ?? props.id;
const fetchEnrolledUsers = async () => {
  try {
    isLoading.value = true
    const response = await getMemberCourse(courseId)
    isTeacherCourse.value = response.teacherId
    enrolledUsers.value = response.enrollment;
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    isLoading.value = false
  }
};

const deleteConfirmationVisible = ref(false);
const deleteConfirmationMessage = ref('Are you sure you want to delete this member?');
const uid = ref<string>('');
const openDeleteDialog = (userUid: string) => {
  // กำหนดค่า uid ที่ต้องการลบ
  uid.value = userUid;
  deleteConfirmationVisible.value = true;
};
const handleDelete = async () => {
  try {

    console.log('uid', uid.value)
    console.log('courseId', courseId)
    const res = await deleteMemberCourse(courseId, uid.value);
    if (res) {
      console.log('Enrollment deleted successfully', res);
    }
  } catch (error) {
    console.error('Error deleting enrollment:', error);
  } finally {
    fetchEnrolledUsers();
    deleteConfirmationVisible.value = false;
  }

};


// ฟังก์ชั่น format วันที่
const formatDate = (date: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(date).toLocaleDateString('en-US', options);
};

// เรียกใช้ฟังก์ชั่นตอนที่ component ถูก mount
onMounted(() => {
  fetchEnrolledUsers();
});
</script>

<style scoped>
h2 {
  text-align: center;
  margin-bottom: 20px;
}
</style>